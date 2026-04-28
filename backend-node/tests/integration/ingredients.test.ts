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

describe('ingredients CRUD + search', () => {
  it('creates, finds via tsvector + trigram, rejects duplicates', async () => {
    const a = await registerAndLogin(app);
    const auth = `Bearer ${a.accessToken}`;

    const create = await request(app)
      .post('/api/v1/ingredients')
      .set('authorization', auth)
      .send({
        name: 'Brown Rice',
        category: 'grain',
        unit: 'g',
        nutrition: { calories: 360, protein: 7.5 },
        aliases: ['arborio swap', 'rice'],
      });
    expect(create.status).toBe(201);

    // exact full-text hit
    const exact = await request(app)
      .get('/api/v1/ingredients?search=brown')
      .set('authorization', auth);
    expect(exact.status).toBe(200);
    expect(exact.body.items.length).toBeGreaterThanOrEqual(1);
    expect(exact.body.items[0].name).toBe('Brown Rice');

    // trigram fuzzy hit
    const fuzzy = await request(app)
      .get('/api/v1/ingredients?search=browm') // typo
      .set('authorization', auth);
    expect(fuzzy.status).toBe(200);
    expect(fuzzy.body.items.length).toBeGreaterThanOrEqual(1);

    // duplicate rejection
    const dup = await request(app)
      .post('/api/v1/ingredients')
      .set('authorization', auth)
      .send({ name: 'brown rice' });
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe('INGREDIENT_EXISTS');
  });
});
