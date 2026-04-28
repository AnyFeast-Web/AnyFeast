import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './User';
import { ClientMeasurement } from './ClientMeasurement';
import { Tag } from './Tag';
import { ClientTag } from './ClientTag';

export type ClientSex = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type ClientStatus = 'active' | 'paused' | 'archived';

@Table({ tableName: 'clients', timestamps: true, paranoid: true })
export class Client extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nutritionistId: string;

  @BelongsTo(() => User)
  declare nutritionist?: User;

  @Column({ type: DataType.STRING(80), allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING(80), allowNull: false })
  declare lastName: string;

  @Column({ type: DataType.STRING(320), allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(32), allowNull: true })
  declare phone: string | null;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  declare dateOfBirth: string | null;

  @Column({
    type: DataType.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true,
  })
  declare sex: ClientSex | null;

  @Default('active')
  @Column({ type: DataType.ENUM('active', 'paused', 'archived'), allowNull: false })
  declare status: ClientStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | null;

  @Default([])
  @Column({ type: DataType.JSONB, allowNull: false })
  declare goals: unknown[];

  @HasMany(() => ClientMeasurement)
  declare measurements?: ClientMeasurement[];

  @BelongsToMany(() => Tag, () => ClientTag)
  declare tags?: Tag[];
}
