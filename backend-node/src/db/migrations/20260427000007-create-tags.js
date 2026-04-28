'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'tags', schema },
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
          onDelete: 'CASCADE',
        },
        label: { type: Sequelize.STRING(64), allowNull: false },
        color: { type: Sequelize.STRING(16), allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );
    await queryInterface.addConstraint({ tableName: 'tags', schema }, {
      fields: ['nutritionist_id', 'label'],
      type: 'unique',
      name: 'tags_nutritionist_label_unique',
    });

    await queryInterface.createTable(
      { tableName: 'client_tags', schema },
      {
        client_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'clients', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        tag_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'tags', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );
    await queryInterface.addConstraint({ tableName: 'client_tags', schema }, {
      fields: ['client_id', 'tag_id'],
      type: 'primary key',
      name: 'client_tags_pkey',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'client_tags', schema });
    await queryInterface.dropTable({ tableName: 'tags', schema });
  },
};
