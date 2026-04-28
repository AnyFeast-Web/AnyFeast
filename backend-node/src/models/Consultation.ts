import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Client } from './Client';
import { User } from './User';

export type ConsultationStatus = 'draft' | 'completed' | 'archived';

@Table({ tableName: 'consultations', timestamps: true })
export class Consultation extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Client)
  @Column({ type: DataType.UUID, allowNull: false })
  declare clientId: string;

  @BelongsTo(() => Client)
  declare client?: Client;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nutritionistId: string;

  @BelongsTo(() => User)
  declare nutritionist?: User;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare consultationDate: string;

  @Default('draft')
  @Column({ type: DataType.ENUM('draft', 'completed', 'archived'), allowNull: false })
  declare status: ConsultationStatus;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare medicalHistory: Record<string, unknown>;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare lifestyle: Record<string, unknown>;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare nutritionHistory: Record<string, unknown>;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare bloodReport: Record<string, unknown>;

  @Default([])
  @Column({ type: DataType.JSONB, allowNull: false })
  declare goals: unknown[];

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare consentSignedAt: Date | null;

  @Column({ type: DataType.STRING(45), allowNull: true })
  declare consentIp: string | null;
}
