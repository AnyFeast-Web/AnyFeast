import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp } from '@/app';
import { sequelize } from '@/db/sequelize';
import { truncateAll } from '../helpers/db';
import { registerAndLogin } from '../helpers/auth';

const app = buildApp();

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await sequelize.close();
});

describe('consultations CRUD', () => {
  it('creates a consultation tied to an owned client and rejects non-owned clients', async () => {
    const a = await registerAndLogin(app);
    const b = await registerAndLogin(app);
    const authA = `Bearer ${a.accessToken}`;
    const authB = `Bearer ${b.accessToken}`;

    const c1 = await request(app)
      .post('/api/v1/clients')
      .set('authorization', authA)
      .send({ firstName: 'A', lastName: 'A' });
    const cAid = c1.body.client.id;

    const ok = await request(app)
      .post('/api/v1/consultations')
      .set('authorization', authA)
      .send({
        clientId: cAid,
        consultationDate: '2026-04-27',
        medicalHistory: { allergies: ['peanuts'] },
      });
    expect(ok.status).toBe(201);
    expect(ok.body.consultation.clientId).toBe(cAid);

    // b cannot create a consultation for a's client
    const bad = await request(app)
      .post('/api/v1/consultations')
      .set('authorization', authB)
      .send({ clientId: cAid, consultationDate: '2026-04-27' });
    expect(bad.status).toBe(404);
    expect(bad.body.error.code).toBe('CLIENT_NOT_FOUND');
  });
});
