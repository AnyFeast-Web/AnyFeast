'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'audit_log', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        actor_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: { tableName: 'users', schema }, key: 'id' },
          onDelete: 'SET NULL',
        },
        action: { type: Sequelize.STRING(64), allowNull: false },
        entity: { type: Sequelize.STRING(64), allowNull: false },
        entity_id: { type: Sequelize.STRING(64), allowNull: true },
        diff: { type: Sequelize.JSONB, allowNull: true },
        ip: { type: Sequelize.STRING(45), allowNull: true },
        request_id: { type: Sequelize.STRING(128), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );

    await queryInterface.addIndex({ tableName: 'audit_log', schema }, ['actor_id'], {
      name: 'audit_log_actor_id_idx',
    });
    await queryInterface.addIndex({ tableName: 'audit_log', schema }, ['entity', 'entity_id'], {
      name: 'audit_log_entity_idx',
    });
    await queryInterface.addIndex({ tableName: 'audit_log', schema }, ['created_at'], {
      name: 'audit_log_created_at_idx',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'audit_log', schema });
  },
};
