import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { MealPlanDay } from './MealPlanDay';

export type MealType =
  | 'breakfast'
  | 'snack_morning'
  | 'lunch'
  | 'snack_afternoon'
  | 'dinner'
  | 'snack_evening';

@Table({ tableName: 'meal_plan_meals', timestamps: true })
export class MealPlanMeal extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => MealPlanDay)
  @Column({ type: DataType.UUID, allowNull: false })
  declare dayId: string;

  @BelongsTo(() => MealPlanDay)
  declare day?: MealPlanDay;

  @Column({
    type: DataType.ENUM(
      'breakfast',
      'snack_morning',
      'lunch',
      'snack_afternoon',
      'dinner',
      'snack_evening',
    ),
    allowNull: false,
  })
  declare mealType: MealType;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare position: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare title: string;

  @Default([])
  @Column({ type: DataType.JSONB, allowNull: false })
  declare ingredients: unknown[];

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare macros: Record<string, unknown>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare instructions: string | null;
}
