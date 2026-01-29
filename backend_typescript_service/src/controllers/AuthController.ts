import { Body, Controller, Get, Post, Route, Security, Request, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import jwt from 'jsonwebtoken';
import { RequestContext } from '@mikro-orm/core';
import { env, UserRole } from '../config/env';
import { User } from '../models/User';
import { comparePassword } from '../lib/password';
import { orm } from '../config/database';
import { HttpError } from '../errors/httpError';

interface RequestWithUser extends ExpressRequest {
  user: {
    username: string;
    role: UserRole;
  };
}

interface LoginRequestBody {
  username?: string;
  password?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  role: string;
  name: string;
}

interface UserInfo {
  _id: string;
  email: string;
  full_name: string;
  role: string;
}

interface VerifyRequestBody {
  token: string;
}

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  @Post('login')
  public async login(@Body() body: LoginRequestBody): Promise<LoginResponse> {
    const { username, password } = body;

    if (!username || !password) {
       throw new HttpError(400, 'Both username and password must be provided as strings.');
    }

    const em = orm.em.fork();
    const user = await em.findOne(User, { username });

    if (!user || !(await comparePassword(password, user.password))) {
      throw new HttpError(401, 'Invalid credentials.');
    }

    const access_token = jwt.sign({ sub: user.username, role: user.role }, env.jwtSecret, { expiresIn: env.jwtTtl });

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: env.jwtTtl,
      role: user.role,
      name: user.fullName || user.username
    };
  }

  @Security('jwt')
  @Get('me')
  public async getMe(@Request() request: RequestWithUser): Promise<UserInfo> {
    const em = RequestContext.getEntityManager()!;
    const user = await em.findOne(User, { username: request.user.username });
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return {
      _id: user._id.toString(),
      email: user.username,
      full_name: user.fullName || user.username,
      role: user.role
    };
  }

  @Security('jwt', ['admin'])
  @Get('users')
  public async getUsers(): Promise<UserInfo[]> {
    const em = RequestContext.getEntityManager()!;
    const users = await em.find(User, {});

    return users.map(user => ({
      _id: user._id.toString(),
      email: user.username,
      full_name: user.fullName || user.username,
      role: user.role
    }));
  }

  @Post('verify')
  public async verify(@Body() body: VerifyRequestBody): Promise<{ valid: boolean; payload: unknown }> {
    if (!body.token) {
      throw new HttpError(400, 'Token is required in request body.');
    }
    try {
      const decoded = jwt.verify(body.token, env.jwtSecret);
      return { valid: true, payload: decoded };
    } catch (error) {
       throw new HttpError(401, 'Invalid or expired token.');
    }
  }
}
