import { Controller, Get, Request, Route, Security, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { HttpError } from '../errors/httpError';
import { UserRole } from '../config/env';

interface RequestWithUser extends ExpressRequest {
  user: {
    username: string;
    role: UserRole;
  };
}

@Route('')
@Tags('General')
export class GeneralController extends Controller {
  @Get('health')
  public async health(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  @Security('jwt')
  @Get('user/profile')
  public async getProfile(@Request() request: RequestWithUser): Promise<unknown> {
    if (request.user.role !== 'user' && request.user.role !== 'admin') {
      throw new HttpError(403, 'Access restricted to user role.');
    }

    return {
      message: 'User profile data',
      user: {
        username: request.user.username,
        role: request.user.role
      }
    };
  }

  @Security('jwt', ['admin'])
  @Get('admin/reports')
  public async getAdminReports(@Request() request: RequestWithUser): Promise<unknown> {
    return {
      message: 'Admin dashboard data',
      user: {
        username: request.user.username,
        role: request.user.role
      }
    };
  }
}
