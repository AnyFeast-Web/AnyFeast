'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'ingredients', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        name: { type: Sequelize.STRING(160), allowNull: false },
        normalized_name: { type: Sequelize.STRING(160), allowNull: false, unique: true },
        category: { type: Sequelize.STRING(64), allowNull: true },
        unit: { type: Sequelize.STRING(16), allowNull: false, defaultValue: 'g' },
        nutrition: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        aliases: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false, defaultValue: [] },
        created_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: { tableName: 'users', schema }, key: 'id' },
          onDelete: 'SET NULL',
        },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );

    // pg_trgm GIN index on normalized_name for fuzzy search
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS ingredients_name_trgm_idx
       ON "${schema}"."ingredients" USING GIN (normalized_name gin_trgm_ops);`,
    );

    // tsvector column + index for full-text search
    await queryInterface.sequelize.query(
      `ALTER TABLE "${schema}"."ingredients"
       ADD COLUMN search_vector tsvector
       GENERATED ALWAYS AS (
         to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(category,'') || ' ' || array_to_string(aliases, ' '))
       ) STORED;`,
    );
    await queryInterface.sequelize.query(
      `CREATE INDEX IF NOT EXISTS ingredients_search_vector_idx
       ON "${schema}"."ingredients" USING GIN (search_vector);`,
    );
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'ingredients', schema });
  },
};
