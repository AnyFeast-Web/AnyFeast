import { Column, DataType, Default, HasMany, Model, Table } from 'sequelize-typescript';
import { RefreshToken } from './RefreshToken';

export type UserRole = 'nutritionist' | 'admin';
export type UserStatus = 'active' | 'pending' | 'disabled';

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class User extends Model {
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(320), allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare passwordHash: string;

  @Column({ type: DataType.STRING(120), allowNull: false })
  declare name: string;

  @Default('nutritionist')
  @Column({ type: DataType.ENUM('nutritionist', 'admin'), allowNull: false })
  declare role: UserRole;

  @Default('pending')
  @Column({ type: DataType.ENUM('active', 'pending', 'disabled'), allowNull: false })
  declare status: UserStatus;

  @Column({ type: DataType.STRING, allowNull: true })
  declare emailVerificationToken: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare emailVerifiedAt: Date | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare passwordResetToken: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare passwordResetExpiresAt: Date | null;

  @HasMany(() => RefreshToken)
  declare refreshTokens?: RefreshToken[];

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      status: this.status,
      emailVerifiedAt: this.emailVerifiedAt,
      createdAt: (this as unknown as { createdAt: Date }).createdAt,
    };
  }
}
