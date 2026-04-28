import { Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'audit_log', timestamps: true, updatedAt: false })
export class AuditLog extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare actorId: string | null;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare action: string;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare entity: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare entityId: string | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare diff: unknown;

  @Column({ type: DataType.STRING(45), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.STRING(128), allowNull: true })
  declare requestId: string | null;
}
