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

@Table({ tableName: 'client_measurements', timestamps: true })
export class ClientMeasurement extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => Client)
  @Column({ type: DataType.UUID, allowNull: false })
  declare clientId: string;

  @BelongsTo(() => Client)
  declare client?: Client;

  @Column({ type: DataType.DATE, allowNull: false })
  declare recordedAt: Date;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: true })
  declare heightCm: string | null;

  @Column({ type: DataType.DECIMAL(6, 2), allowNull: true })
  declare weightKg: string | null;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: true })
  declare bodyFatPct: string | null;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: true })
  declare waistCm: string | null;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: true })
  declare hipCm: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;
}
