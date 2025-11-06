// Subscription entity for TypeORM

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

export enum SubscriptionType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
  API_STARTER = 'API_STARTER',
  API_PROFESSIONAL = 'API_PROFESSIONAL',
  API_ENTERPRISE = 'API_ENTERPRISE',
  TEAM_STARTER = 'TEAM_STARTER',
  TEAM_METERED = 'TEAM_METERED',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'varchar', length: 255 })
  productId!: string;

  @Column({ type: 'varchar', length: 255 })
  productName!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  subscriptionType!: SubscriptionType;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  subscriptionStatus!: SubscriptionStatus;

  @Column({ type: 'int' })
  amount!: number; // Price in cents

  @Column({ type: 'varchar', length: 3, default: 'usd' })
  currency!: string;

  @Column({ type: 'datetime' })
  startDate!: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date;

  @Column({ type: 'boolean', default: true })
  autoRenew!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripePaymentIntentId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stripeSubscriptionId?: string;

  @Column({ type: 'datetime', nullable: true })
  cancelledAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
