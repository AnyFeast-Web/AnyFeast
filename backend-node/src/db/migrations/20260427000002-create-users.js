'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'users', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        email: { type: Sequelize.STRING(320), allowNull: false, unique: true },
        password_hash: { type: Sequelize.STRING, allowNull: false },
        name: { type: Sequelize.STRING(120), allowNull: false },
        role: {
          type: Sequelize.ENUM('nutritionist', 'admin'),
          allowNull: false,
          defaultValue: 'nutritionist',
        },
        status: {
          type: Sequelize.ENUM('active', 'pending', 'disabled'),
          allowNull: false,
          defaultValue: 'pending',
        },
        email_verification_token: { type: Sequelize.STRING, allowNull: true },
        email_verified_at: { type: Sequelize.DATE, allowNull: true },
        password_reset_token: { type: Sequelize.STRING, allowNull: true },
        password_reset_expires_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      },
    );

    await queryInterface.addIndex({ tableName: 'users', schema }, ['email'], {
      name: 'users_email_unique',
      unique: true,
    });
    await queryInterface.addIndex({ tableName: 'users', schema }, ['status'], {
      name: 'users_status_idx',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'users', schema });
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_users_role";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_users_status";`);
  },
};
