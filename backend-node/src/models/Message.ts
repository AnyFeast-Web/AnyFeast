import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './User';
import { Client } from './Client';

export type MessageDirection = 'inbound' | 'outbound';

@Table({ tableName: 'messages', timestamps: true })
export class Message extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nutritionistId: string;

  @BelongsTo(() => User)
  declare nutritionist?: User;

  @ForeignKey(() => Client)
  @Column({ type: DataType.UUID, allowNull: true })
  declare clientId: string | null;

  @BelongsTo(() => Client)
  declare client?: Client;

  @Column({ type: DataType.ENUM('inbound', 'outbound'), allowNull: false })
  declare direction: MessageDirection;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare fromNumber: string | null;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare toNumber: string | null;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare body: string;

  @Column({ type: DataType.STRING(64), allowNull: true, unique: true })
  declare twilioSid: string | null;

  @Default('queued')
  @Column({ type: DataType.STRING(32), allowNull: false })
  declare status: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare error: unknown;

  @Column({ type: DataType.DATE, allowNull: true })
  declare readAt: Date | null;
}
