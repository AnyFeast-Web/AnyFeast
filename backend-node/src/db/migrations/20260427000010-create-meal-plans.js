'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';

    await queryInterface.createTable(
      { tableName: 'meal_plans', schema },
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
          allowNull: false,
          references: { model: { tableName: 'clients', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        title: { type: Sequelize.STRING(160), allowNull: false },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        end_date: { type: Sequelize.DATEONLY, allowNull: false },
        status: {
          type: Sequelize.ENUM('draft', 'published', 'archived'),
          allowNull: false,
          defaultValue: 'draft',
        },
        nutrition_targets: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        guidelines: { type: Sequelize.TEXT, allowNull: true },
        grocery_list: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        sent_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );
    await queryInterface.addIndex({ tableName: 'meal_plans', schema }, ['client_id'], {
      name: 'meal_plans_client_idx',
    });
    await queryInterface.addIndex(
      { tableName: 'meal_plans', schema },
      ['nutritionist_id', 'created_at', 'id'],
      { name: 'meal_plans_pagination_idx' },
    );

    await queryInterface.createTable(
      { tableName: 'meal_plan_days', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        meal_plan_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'meal_plans', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        day_index: { type: Sequelize.INTEGER, allowNull: false },
        date: { type: Sequelize.DATEONLY, allowNull: true },
        notes: { type: Sequelize.TEXT, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );
    await queryInterface.addConstraint({ tableName: 'meal_plan_days', schema }, {
      fields: ['meal_plan_id', 'day_index'],
      type: 'unique',
      name: 'meal_plan_days_plan_index_unique',
    });

    await queryInterface.createTable(
      { tableName: 'meal_plan_meals', schema },
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        day_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'meal_plan_days', schema }, key: 'id' },
          onDelete: 'CASCADE',
        },
        meal_type: {
          type: Sequelize.ENUM('breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner', 'snack_evening'),
          allowNull: false,
        },
        position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        title: { type: Sequelize.STRING(200), allowNull: false },
        ingredients: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
        macros: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        instructions: { type: Sequelize.TEXT, allowNull: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      },
    );
    await queryInterface.addIndex({ tableName: 'meal_plan_meals', schema }, ['day_id'], {
      name: 'meal_plan_meals_day_idx',
    });
  },

  async down(queryInterface) {
    const schema = queryInterface.sequelize.options.schema || 'nutritionist';
    await queryInterface.dropTable({ tableName: 'meal_plan_meals', schema });
    await queryInterface.dropTable({ tableName: 'meal_plan_days', schema });
    await queryInterface.dropTable({ tableName: 'meal_plans', schema });
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_meal_plans_status";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${schema}"."enum_meal_plan_meals_meal_type";`);
  },
};
