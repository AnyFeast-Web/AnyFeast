import { BelongsTo, Column, DataType, Default, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'refresh_tokens', timestamps: true, updatedAt: false })
export class RefreshToken extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => User)
  declare user?: User;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare tokenHash: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare revokedAt: Date | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare replacedById: string | null;

  @Column({ type: DataType.STRING(45), allowNull: true })
  declare ip: string | null;

  @Column({ type: DataType.STRING(512), allowNull: true })
  declare userAgent: string | null;

  isActive(): boolean {
    return !this.revokedAt && this.expiresAt.getTime() > Date.now();
  }
}
