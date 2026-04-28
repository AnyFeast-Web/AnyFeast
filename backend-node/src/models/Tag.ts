import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './User';
import { Client } from './Client';
import { ClientTag } from './ClientTag';

@Table({ tableName: 'tags', timestamps: true })
export class Tag extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare nutritionistId: string;

  @BelongsTo(() => User)
  declare nutritionist?: User;

  @Column({ type: DataType.STRING(64), allowNull: false })
  declare label: string;

  @Column({ type: DataType.STRING(16), allowNull: true })
  declare color: string | null;

  @BelongsToMany(() => Client, () => ClientTag)
  declare clients?: Client[];
}
