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
import { User } from './User';
import { Client } from './Client';
import { MealPlanDay } from './MealPlanDay';

export type MealPlanStatus = 'draft' | 'published' | 'archived';

@Table({ tableName: 'meal_plans', timestamps: true })
export class MealPlan extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nutritionistId: string;

  @BelongsTo(() => User)
  declare nutritionist?: User;

  @ForeignKey(() => Client)
  @Column({ type: DataType.UUID, allowNull: false })
  declare clientId: string;

  @BelongsTo(() => Client)
  declare client?: Client;

  @Column({ type: DataType.STRING(160), allowNull: false })
  declare title: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare startDate: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare endDate: string;

  @Default('draft')
  @Column({ type: DataType.ENUM('draft', 'published', 'archived'), allowNull: false })
  declare status: MealPlanStatus;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare nutritionTargets: Record<string, unknown>;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare guidelines: string | null;

  @Default([])
  @Column({ type: DataType.JSONB, allowNull: false })
  declare groceryList: unknown[];

  @Column({ type: DataType.DATE, allowNull: true })
  declare sentAt: Date | null;

  @HasMany(() => MealPlanDay)
  declare days?: MealPlanDay[];
}
