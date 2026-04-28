'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'consultations', schema },
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
        nutritionist_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'users', schema }, key: 'id' },
          onDelete: 'RESTRICT',
        },
        consultation_date: { type: Sequelize.DATEONLY, allowNull: false },
        status: {
          type: Sequelize.ENUM('draft', 'completed', 'archived'),
          allowNull: false,
          defaultValue: 'draft',
        },
        medical_history: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        lifestyle: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        nutrition_history: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        blood_report: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        goals: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        notes: { type: Sequelize.TEXT, allowNull: true },
        consent_signed_at: { type: Sequelize.DATE, allowNull: true },
        consent_ip: { type: Sequelize.STRING(45), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );

    await queryInterface.addIndex({ tableName: 'consultations', schema }, ['client_id'], {
      name: 'consultations_client_idx',
    });
    await queryInterface.addIndex({ tableName: 'consultations', schema }, ['nutritionist_id', 'created_at', 'id'], {
      name: 'consultations_pagination_idx',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'consultations', schema });
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_consultations_status";`);
  },
};
