import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Client } from './Client';
import { Tag } from './Tag';

@Table({ tableName: 'client_tags', timestamps: true, updatedAt: false })
export class ClientTag extends Model {
  @ForeignKey(() => Client)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare clientId: string;

  @ForeignKey(() => Tag)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare tagId: string;
}
