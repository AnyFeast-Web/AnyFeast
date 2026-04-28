'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'client_measurements', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        client_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'clients', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        recorded_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        height_cm: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        weight_kg: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
        body_fat_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        waist_cm: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        hip_cm: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );

    await queryInterface.addIndex({ tableName: 'client_measurements', schema }, ['client_id', 'recorded_at'], {
      name: 'client_measurements_client_recorded_idx',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'client_measurements', schema });
  },
};
