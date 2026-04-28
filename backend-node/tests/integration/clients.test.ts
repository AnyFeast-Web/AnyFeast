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

describe('clients CRUD', () => {
  it('creates, lists, gets, updates, soft-deletes a client and is tenant-scoped', async () => {
    const a = await registerAndLogin(app);
    const b = await registerAndLogin(app);

    // a creates
    const created = await request(app)
      .post('/api/v1/clients')
      .set('authorization', `Bearer ${a.accessToken}`)
      .send({ firstName: 'Casey', lastName: 'Doe', goals: ['lose 5kg'] });
    expect(created.status).toBe(201);
    const id = created.body.client.id;

    // b cannot see a's client
    const seenByB = await request(app)
      .get(`/api/v1/clients/${id}`)
      .set('authorization', `Bearer ${b.accessToken}`);
    expect(seenByB.status).toBe(404);

    // a lists their own
    const listed = await request(app)
      .get('/api/v1/clients')
      .set('authorization', `Bearer ${a.accessToken}`);
    expect(listed.status).toBe(200);
    expect(listed.body.items).toHaveLength(1);

    // update
    const updated = await request(app)
      .patch(`/api/v1/clients/${id}`)
      .set('authorization', `Bearer ${a.accessToken}`)
      .send({ status: 'paused' });
    expect(updated.status).toBe(200);
    expect(updated.body.client.status).toBe('paused');

    // measurement
    const mres = await request(app)
      .post(`/api/v1/clients/${id}/measurements`)
      .set('authorization', `Bearer ${a.accessToken}`)
      .send({ weightKg: 72.5 });
    expect(mres.status).toBe(201);

    // soft-delete
    const del = await request(app)
      .delete(`/api/v1/clients/${id}`)
      .set('authorization', `Bearer ${a.accessToken}`);
    expect(del.status).toBe(204);

    const after = await request(app)
      .get('/api/v1/clients')
      .set('authorization', `Bearer ${a.accessToken}`);
    expect(after.body.items).toHaveLength(0);
  });

  it('rejects unauthenticated requests', async () => {
    const r = await request(app).get('/api/v1/clients');
    expect(r.status).toBe(401);
  });

  it('validates the create payload', async () => {
    const a = await registerAndLogin(app);
    const r = await request(app)
      .post('/api/v1/clients')
      .set('authorization', `Bearer ${a.accessToken}`)
      .send({ firstName: '', lastName: 'X' });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe('VALIDATION_ERROR');
  });
});
