// User entity for TypeORM

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './Subscription';

export enum UserRole {
  USER = 'user',
  DEVELOPER = 'developer',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'int', default: 50 })
  token!: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeCustomerId?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'datetime', nullable: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions!: Subscription[];
}
