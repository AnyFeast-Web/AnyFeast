import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp } from '@/app';
import { sequelize } from '@/db/sequelize';
import { truncateAll } from '../helpers/db';

const app = buildApp();

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await sequelize.close();
});

const sample = {
  email: 'alice@example.com',
  password: 'CorrectHorseBattery9',
  name: 'Alice',
};

describe('POST /api/v1/auth/register', () => {
  it('creates a user and returns a safe payload', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(sample);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(sample.email);
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.verificationToken).toBeTypeOf('string');
  });

  it('rejects duplicate emails', async () => {
    await request(app).post('/api/v1/auth/register').send(sample);
    const res = await request(app).post('/api/v1/auth/register').send(sample);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...sample, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/v1/auth/register').send(sample);
  });

  it('issues access + refresh tokens on success', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sample.email, password: sample.password });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.refreshToken).toBeTypeOf('string');
    expect(res.body.user.email).toBe(sample.email);
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sample.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects unknown email with same code (no user enumeration)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nope@example.com', password: 'anything12345' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('POST /api/v1/auth/refresh', () => {
  it('rotates the refresh token and revokes the old one', async () => {
    await request(app).post('/api/v1/auth/register').send(sample);
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sample.email, password: sample.password });

    const first = login.body.refreshToken;
    const r1 = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: first });
    expect(r1.status).toBe(200);
    expect(r1.body.refreshToken).not.toBe(first);

    // old one should now be rejected
    const r2 = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: first });
    expect(r2.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('requires a Bearer token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user when token is valid', async () => {
    await request(app).post('/api/v1/auth/register').send(sample);
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: sample.email, password: sample.password });
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(sample.email);
  });
});
