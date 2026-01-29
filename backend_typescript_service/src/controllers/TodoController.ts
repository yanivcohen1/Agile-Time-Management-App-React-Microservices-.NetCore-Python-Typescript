import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  Security,
  Request,
  Tags,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { RequestContext, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { Todo, TodoStatus } from '../models/Todo';
import { User } from '../models/User';
import { HttpError } from '../errors/httpError';
import { UserRole } from '../config/env';
import { ObjectId, MongoEntityManager } from '@mikro-orm/mongodb';

interface RequestWithUser extends ExpressRequest {
  user: {
    username: string;
    role: UserRole;
  };
}

interface TodoCreateRequest {
  title: string;
  description?: string;
  status?: TodoStatus;
  due_date?: string;
  duration?: string;
}

interface PaginatedTodoResponse {
  items: Todo[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

@Route('todos')
@Tags('Todos')
@Security('jwt')
export class TodoController extends Controller {
  @Get('')
  public async getTodos(
    @Request() request: RequestWithUser,
    @Query() page = 1,
    @Query() size = 10,
    @Query() sort_by = 'created_at',
    @Query() sort_desc = 'true',
    @Query() status?: TodoStatus,
    @Query() search?: string,
    @Query() due_date_start?: string,
    @Query() due_date_end?: string,
    @Query() user_id?: string
  ): Promise<PaginatedTodoResponse> {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: request.user.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    let targetUserId = currentUser._id;
    if (user_id) {
      if (request.user.role !== 'admin') {
        throw new HttpError(403, "Only admins can access other users' todos");
      }
      if (!ObjectId.isValid(user_id)) {
        throw new HttpError(400, 'Invalid user ID format');
      }
      targetUserId = new ObjectId(user_id);
    }

    const filter: Record<string, unknown> = { 'user.$id': targetUserId };
    if (status) filter.status = status;
    if (search) filter.title = { $re: search, $options: 'i' };

    if (due_date_start || due_date_end) {
      const dateFilter: Record<string, unknown> = {};
      if (due_date_start) dateFilter.$gte = new Date(due_date_start);
      if (due_date_end) {
        const endDate = new Date(due_date_end);
        if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
          endDate.setHours(23, 59, 59, 999);
        }
        dateFilter.$lte = endDate;
      }
      filter.due_date = dateFilter;
    }

    const sortOrder = sort_desc === 'true' ? QueryOrder.DESC : QueryOrder.ASC;
    const [todos, total] = await em.findAndCount(Todo, filter as unknown as FilterQuery<Todo>, {
      orderBy: { [sort_by]: sortOrder } as Record<string, QueryOrder>,
      limit: size,
      offset: (page - 1) * size,
    });

    return {
      items: todos,
      total,
      page,
      size,
      pages: Math.ceil(total / size),
    };
  }

  @Post('')
  public async createTodo(@Request() request: RequestWithUser, @Body() body: TodoCreateRequest): Promise<Todo> {
    const em = RequestContext.getEntityManager()!;
    const currentUser = await em.findOne(User, { username: request.user.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const todo = em.create(Todo, {
      ...body,
      user: { $id: currentUser._id, $ref: 'users' },
    } as unknown as Todo);

    if (body.due_date) {
      const date = new Date(body.due_date);
      date.setHours(12, 0, 0, 0);
      todo.due_date = date;
    }

    await em.persistAndFlush(todo);
    this.setStatus(201);
    return todo;
  }

  @Get('stats/status')
  public async getStatsStatus(@Request() request: RequestWithUser): Promise<Record<string, number>> {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: request.user.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const collection = em.getCollection(Todo);
    const stats = await collection.aggregate([
      { $match: { 'user.$id': currentUser._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    const result: Record<string, number> = {
      BACKLOG: 0,
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    };

    (stats as { _id: string; count: number }[]).forEach((s) => {
      if (s._id in result) result[s._id] = s.count;
    });

    return result;
  }

  @Get('stats/workload')
  public async getStatsWorkload(@Request() request: RequestWithUser): Promise<unknown[]> {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: request.user.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const collection = em.getCollection(Todo);
    return await collection.aggregate([
      { $match: { 'user.$id': currentUser._id, due_date: { $ne: null } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$due_date' } },
        total: { $sum: 1 },
        backlog: { $sum: { $cond: [{ $eq: ['$status', 'BACKLOG'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        in_progress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]).toArray();
  }

  @Put('{id}')
  public async updateTodo(
    @Path() id: string,
    @Request() request: RequestWithUser,
    @Body() body: Partial<TodoCreateRequest>
  ): Promise<Todo> {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: request.user.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    if (!ObjectId.isValid(id)) throw new HttpError(400, 'Invalid ID format');

    const todo = await em.findOne(Todo, {
      _id: new ObjectId(id),
      'user.$id': currentUser._id
    } as FilterQuery<Todo>);
    if (!todo) throw new HttpError(404, 'Todo not found');

    em.assign(todo, body);
    if (body.due_date) {
      const date = new Date(body.due_date);
      date.setHours(12, 0, 0, 0);
      todo.due_date = date;
    }

    await em.flush();
    return todo;
  }

  @Delete('{id}')
  public async deleteTodo(@Path() id: string, @Request() request: RequestWithUser): Promise<{ message: string }> {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: request.user.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    if (!ObjectId.isValid(id)) throw new HttpError(400, 'Invalid ID format');

    const todo = await em.findOne(Todo, {
      _id: new ObjectId(id),
      'user.$id': currentUser._id
    } as FilterQuery<Todo>);
    if (!todo) throw new HttpError(404, 'Todo not found');

    await em.removeAndFlush(todo);
    return { message: 'Todo deleted' };
  }
}
