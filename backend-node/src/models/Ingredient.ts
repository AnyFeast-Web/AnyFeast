import { Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'ingredients', timestamps: true })
export class Ingredient extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(160), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(160), allowNull: false, unique: true })
  declare normalizedName: string;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare category: string | null;

  @Default('g')
  @Column({ type: DataType.STRING(16), allowNull: false })
  declare unit: string;

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: false })
  declare nutrition: Record<string, unknown>;

  @Default([])
  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false })
  declare aliases: string[];

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  declare createdBy: string | null;
}

export function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
