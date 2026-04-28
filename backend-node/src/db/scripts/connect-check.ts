import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');

  const ssl = process.env.DB_SSL === 'true';
  const client = new Client({ connectionString: url, ssl: ssl ? { rejectUnauthorized: false } : undefined });

  await client.connect();
  const v = await client.query<{ version: string }>('SELECT version()');
  const db = await client.query<{ current_database: string }>('SELECT current_database()');
  const schemas = await client.query<{ schema_name: string }>(
    `SELECT schema_name FROM information_schema.schemata
     WHERE schema_name NOT LIKE 'pg_%' AND schema_name NOT IN ('information_schema')
     ORDER BY schema_name`,
  );
  console.log('connected:', db.rows[0]?.current_database);
  console.log('version:', v.rows[0]?.version);
  console.log('schemas:', schemas.rows.map((r) => r.schema_name).join(', '));
  await client.end();
}

main().catch((err) => {
  console.error('connect failed:', err.message);
  process.exit(1);
});
