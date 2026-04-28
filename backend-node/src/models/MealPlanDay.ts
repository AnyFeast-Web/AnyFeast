import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { MealPlan } from './MealPlan';
import { MealPlanMeal } from './MealPlanMeal';

@Table({ tableName: 'meal_plan_days', timestamps: true })
export class MealPlanDay extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => MealPlan)
  @Column({ type: DataType.UUID, allowNull: false })
  declare mealPlanId: string;

  @BelongsTo(() => MealPlan)
  declare mealPlan?: MealPlan;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare dayIndex: number;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare date: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @HasMany(() => MealPlanMeal)
  declare meals?: MealPlanMeal[];
}
