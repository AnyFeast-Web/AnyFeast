'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'refresh_tokens', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'users', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        token_hash: { type: Sequelize.STRING, allowNull: false, unique: true },
        expires_at: { type: Sequelize.DATE, allowNull: false },
        revoked_at: { type: Sequelize.DATE, allowNull: true },
        replaced_by_id: { type: Sequelize.STRING, allowNull: true },
        ip: { type: Sequelize.STRING(45), allowNull: true },
        user_agent: { type: Sequelize.STRING(512), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );

    await queryInterface.addIndex({ tableName: 'refresh_tokens', schema }, ['user_id'], {
      name: 'refresh_tokens_user_id_idx',
    });
    await queryInterface.addIndex({ tableName: 'refresh_tokens', schema }, ['token_hash'], {
      name: 'refresh_tokens_token_hash_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'refresh_tokens', schema });
  },
};
