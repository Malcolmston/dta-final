// TeamMember Entity - for team membership and roles

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './Team';
import { User } from './User';

export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  BASIC = 'BASIC',
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  teamId!: number;

  @ManyToOne(() => Team, (team) => team.members)
  @JoinColumn({ name: 'teamId' })
  team!: Team;

  @Column({ type: 'int' })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.BASIC,
  })
  role!: TeamRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
