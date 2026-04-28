import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { spawnSync } from 'child_process';
import path from 'path';

let pg: StartedTestContainer | undefined;

export async function startPostgres(): Promise<string> {
  if (pg) return process.env.DATABASE_URL!;

  pg = await new GenericContainer('postgres:16')
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'test',
    })
    .withExposedPorts(5432)
    .withWaitStrategy(Wait.forLogMessage(/database system is ready to accept connections/, 2))
    .start();

  const host = pg.getHost();
  const port = pg.getMappedPort(5432);
  const url = `postgres://test:test@${host}:${port}/test`;

  process.env.DATABASE_URL = url;
  process.env.DB_SCHEMA = 'nutritionist';
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = 'test_access_secret_must_be_at_least_32_chars';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_must_be_at_least_32_chars';
  process.env.CORS_ORIGINS = 'http://localhost:5173';

  const result = spawnSync('npx', ['sequelize-cli', 'db:migrate'], {
    cwd: path.resolve(__dirname, '..', '..'),
    stdio: 'inherit',
    env: { ...process.env },
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`migrations failed with exit code ${result.status}`);
  }

  return url;
}

export async function stopPostgres(): Promise<void> {
  if (pg) {
    await pg.stop();
    pg = undefined;
  }
}

import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  await startPostgres();
}, 120_000);

afterAll(async () => {
  await stopPostgres();
});
