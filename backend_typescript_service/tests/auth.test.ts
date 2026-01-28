import request from 'supertest';
import app from '../src/app';

const ADMIN_USERNAME = process.env.AUTH_ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD ?? 'admin-secret';

const USER_USERNAME = process.env.AUTH_USER_USERNAME ?? 'user';
const USER_PASSWORD = process.env.AUTH_USER_PASSWORD ?? 'user-secret';

async function login(username: string, password: string): Promise<{ token: string; role: string }> {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ username, password })
    .expect(200);

  return { token: response.body.access_token, role: response.body.role };
}

describe('Auth routes', () => {
  describe('POST /api/auth/login', () => {
    it('returns a JWT when credentials are valid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: USER_USERNAME, password: USER_PASSWORD })
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          access_token: expect.any(String),
          tokenType: 'Bearer',
          expiresIn: parseInt(process.env.JWT_ACCESS_TTL_SECONDS || '3600'),
          role: 'user'
        })
      );
      expect(response.body.access_token).not.toHaveLength(0);
    });

    it('rejects invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wrong', password: 'credentials' })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Invalid credentials.'
        })
      );
    });

    it('validates request payload presence', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: USER_USERNAME })
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Both username and password must be provided as strings.'
        })
      );
    });
  });

  describe('POST /api/auth/verify', () => {
    it('confirms a valid token', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: USER_USERNAME, password: USER_PASSWORD })
        .expect(200);

      const verifyResponse = await request(app)
        .post('/api/auth/verify')
        .send({ token: loginResponse.body.access_token })
        .expect(200);

      expect(verifyResponse.body).toEqual(
        expect.objectContaining({
          valid: true,
          payload: expect.objectContaining({
            sub: USER_USERNAME,
            role: 'user'
          })
        })
      );
    });

    it('rejects malformed tokens', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({ token: 'not-a-valid-token' })
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Invalid or expired token.'
        })
      );
    });

    it('requires token in request body', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({})
        .expect(400);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Token is required in request body.'
        })
      );
    });
  });

  describe('Protected routes', () => {
    it('allows user with user role to access user route', async () => {
      const { token } = await login(USER_USERNAME, USER_PASSWORD);

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'User profile data',
          user: expect.objectContaining({
            username: USER_USERNAME,
            role: 'user'
          })
        })
      );
    });

    it('blocks user token from accessing admin route', async () => {
      const { token } = await login(USER_USERNAME, USER_PASSWORD);

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Access restricted to admin role.'
        })
      );
    });

    it('allows admin role to access admin route', async () => {
      const { token } = await login(ADMIN_USERNAME, ADMIN_PASSWORD);

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Admin dashboard data',
          user: expect.objectContaining({
            username: ADMIN_USERNAME,
            role: 'admin'
          })
        })
      );
    });

    it('blocks admin role from accessing user route', async () => {
      const { token } = await login(ADMIN_USERNAME, ADMIN_PASSWORD);

      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Access restricted to user role.'
        })
      );
    });

    it('rejects requests without token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .expect(401);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: 'Authorization header missing or malformed.'
        })
      );
    });
  });
});

describe('Public routes', () => {
  it('returns healthy status without auth', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok'
      })
    );
  });
});
