require('dotenv').config();

const schema = process.env.DB_SCHEMA || 'nutritionist';
const ssl = process.env.DB_SSL === 'true';

const base = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  schema,
  migrationStorageTableSchema: schema,
  seederStorageTableSchema: schema,
  dialectOptions: ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
};

module.exports = {
  development: base,
  test: { ...base, url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL },
  production: base,
};
