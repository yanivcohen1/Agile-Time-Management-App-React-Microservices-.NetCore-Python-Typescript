import { Router, Request, Response, NextFunction } from 'express';
import { RequestContext, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { Todo } from '../models/Todo';
import { User } from '../models/User';
import { authenticate } from '../middleware/authenticate';
import { HttpError } from '../errors/httpError';
import { ObjectId, MongoEntityManager } from '@mikro-orm/mongodb';

const router = Router();

router.use(authenticate);

// List Todos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      size = 10,
      sort_by = 'created_at',
      sort_desc = 'true',
      status,
      search,
      due_date_start,
      due_date_end,
      user_id,
    } = req.query;

    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    
    const currentUser = await em.findOne(User, { username: req.user!.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    let targetUserId = currentUser._id;
    if (user_id) {
      if (req.user!.role !== 'admin') {
        throw new HttpError(403, 'Only admins can access other users\' todos');
      }
      targetUserId = new ObjectId(user_id as string);
    }

    const filter: Record<string, unknown> = { 'user.$id': targetUserId };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = { $re: search as string, $options: 'i' };
    }

    if (due_date_start || due_date_end) {
      const dateFilter: Record<string, unknown> = {};
      if (due_date_start) {
        dateFilter.$gte = new Date(due_date_start as string);
      }
      if (due_date_end) {
        const endDate = new Date(due_date_end as string);
        if (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0) {
            endDate.setHours(23, 59, 59, 999);
        }
        dateFilter.$lte = endDate;
      }
      filter.due_date = dateFilter;
    }

    const sortField = sort_by as string;
    const sortOrder = sort_desc === 'true' ? QueryOrder.DESC : QueryOrder.ASC;

    const [todos, total] = await em.findAndCount(Todo, filter as unknown as FilterQuery<Todo>, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderBy: { [sortField]: sortOrder } as any,
      limit: Number(size),
      offset: (Number(page) - 1) * Number(size),
    });

    res.json({
      items: todos,
      total,
      page: Number(page),
      size: Number(size),
      pages: Math.ceil(total / Number(size)),
    });
  } catch (err) {
    next(err);
  }
});

// Create Todo
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager()!;
    const currentUser = await em.findOne(User, { username: req.user!.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const todo = em.create(Todo, {
      ...req.body,
      user: { $id: currentUser._id, $ref: 'users' },
    });

    if (todo.due_date) {
        const date = new Date(todo.due_date);
        date.setHours(12, 0, 0, 0);
        todo.due_date = date;
    }

    await em.persistAndFlush(todo);
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
});

// Get Stats by Status
router.get('/stats/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: req.user!.username });
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

    (stats as unknown as { _id: string; count: number }[]).forEach((s) => {
      if (s._id in result) {
        result[s._id] = s.count;
      }
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Get Workload Stats
router.get('/stats/workload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: req.user!.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const collection = em.getCollection(Todo);
    const stats = await collection.aggregate([
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

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Update Todo
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: req.user!.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const todo = await em.findOne(Todo, {
      _id: new ObjectId(req.params.id),
      user: { $id: currentUser._id }
    } as FilterQuery<Todo>);
    if (!todo) throw new HttpError(404, 'Todo not found');

    em.assign(todo, req.body);
    
    if (req.body.due_date) {
        const date = new Date(req.body.due_date);
        date.setHours(12, 0, 0, 0);
        todo.due_date = date;
    }

    await em.flush();
    res.json(todo);
  } catch (err) {
    next(err);
  }
});

// Delete Todo
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const em = RequestContext.getEntityManager()! as MongoEntityManager;
    const currentUser = await em.findOne(User, { username: req.user!.username });
    if (!currentUser) throw new HttpError(401, 'User not found');

    const todo = await em.findOne(Todo, {
      _id: new ObjectId(req.params.id),
      user: { $id: currentUser._id }
    } as FilterQuery<Todo>);
    if (!todo) throw new HttpError(404, 'Todo not found');

    await em.removeAndFlush(todo);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
