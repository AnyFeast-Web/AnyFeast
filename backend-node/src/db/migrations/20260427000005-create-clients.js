'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'clients', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        nutritionist_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'users', schema }, key: 'id' },
          onDelete: 'RESTRICT',
        },
        first_name: { type: Sequelize.STRING(80), allowNull: false },
        last_name: { type: Sequelize.STRING(80), allowNull: false },
        email: { type: Sequelize.STRING(320), allowNull: true },
        phone: { type: Sequelize.STRING(32), allowNull: true },
        date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
        sex: {
          type: Sequelize.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('active', 'paused', 'archived'),
          allowNull: false,
          defaultValue: 'active',
        },
        notes: { type: Sequelize.TEXT, allowNull: true },
        goals: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
    );

    await queryInterface.addIndex({ tableName: 'clients', schema }, ['nutritionist_id'], {
      name: 'clients_nutritionist_id_idx',
    });
    await queryInterface.addIndex({ tableName: 'clients', schema }, ['nutritionist_id', 'status'], {
      name: 'clients_nutritionist_status_idx',
    });
    await queryInterface.addIndex(
      { tableName: 'clients', schema },
      ['nutritionist_id', 'created_at', 'id'],
      { name: 'clients_pagination_idx' },
    );
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'clients', schema });
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_clients_sex";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_clients_status";`);
  },
};
