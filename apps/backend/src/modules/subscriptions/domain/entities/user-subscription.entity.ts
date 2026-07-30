import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../user/domain/entities/user.entity';
import { SubscriptionBundle } from './subscription-bundle.entity';

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => SubscriptionBundle)
  @JoinColumn({ name: 'bundleId' })
  bundle: SubscriptionBundle;

  @Column()
  bundleId: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  renewalDate: Date;

  @Column({ default: true })
  autoRenew: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isYearly: boolean;

  @Column({ default: 0 })
  usedQouta: number;
}
