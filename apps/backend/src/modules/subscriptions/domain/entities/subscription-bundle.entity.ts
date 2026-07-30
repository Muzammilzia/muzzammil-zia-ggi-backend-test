import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum BundleTier {
  FREE = 'Free',
  BASIC = 'Basic',
  PRO = 'Pro',
  ENTERPRISE = 'Enterprise',
}

@Entity('subscription_bundles')
export class SubscriptionBundle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BundleTier,
    unique: true,
  })
  tier: BundleTier;

  @Column()
  maxMessages: number;

  @Column('decimal')
  price: number;

  @Column({ default: false })
  isUnlimited: boolean;
}
