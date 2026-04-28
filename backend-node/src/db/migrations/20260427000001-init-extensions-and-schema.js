'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    // Azure Postgres allow-lists extensions; only enable what we actually use.
    // gen_random_uuid() is built into PG 13+, so pgcrypto and uuid-ossp aren't required.
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm";');
    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.sequelize.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
  },
};
