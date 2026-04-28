'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'messages', schema },
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
        client_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: { tableName: 'clients', schema }, key: 'id' },
          onDelete: 'SET NULL',
        },
        direction: {
          type: Sequelize.ENUM('inbound', 'outbound'),
          allowNull: false,
        },
        from_number: { type: Sequelize.STRING(32), allowNull: true },
        to_number: { type: Sequelize.STRING(32), allowNull: true },
        body: { type: Sequelize.TEXT, allowNull: false },
        twilio_sid: { type: Sequelize.STRING(64), allowNull: true, unique: true },
        status: {
          type: Sequelize.STRING(32),
          allowNull: false,
          defaultValue: 'queued',
        },
        error: { type: Sequelize.JSONB, allowNull: true },
        read_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );
    await queryInterface.addIndex({ tableName: 'messages', schema }, ['nutritionist_id', 'created_at', 'id'], {
      name: 'messages_pagination_idx',
    });
    await queryInterface.addIndex({ tableName: 'messages', schema }, ['client_id'], {
      name: 'messages_client_idx',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'messages', schema });
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_messages_direction";`);
  },
};
