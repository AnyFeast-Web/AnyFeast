import request from 'supertest';
import { Express } from 'express';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  accessToken: string;
  refreshToken: string;
  id: string;
}

export async function registerAndLogin(app: Express, override?: Partial<TestUser>): Promise<TestUser> {
  const email = override?.email ?? `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = override?.password ?? 'CorrectHorseBattery9';
  const name = override?.name ?? 'Test User';

  const reg = await request(app).post('/api/v1/auth/register').send({ email, password, name });
  if (reg.status !== 201) throw new Error(`register failed: ${reg.status} ${JSON.stringify(reg.body)}`);

  const login = await request(app).post('/api/v1/auth/login').send({ email, password });
  if (login.status !== 200) throw new Error(`login failed: ${login.status} ${JSON.stringify(login.body)}`);

  return {
    email,
    password,
    name,
    accessToken: login.body.accessToken,
    refreshToken: login.body.refreshToken,
    id: login.body.user.id,
  };
}
