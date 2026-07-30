import { BundleTier } from "src/modules/subscriptions/domain/entities/subscription-bundle.entity";

export const SUBSCRIPTION_BUNDLE_SEED = [
  {
    tier: BundleTier.FREE,
    maxMessages: 3,
    price: 0,
    isUnlimited: false,
  },
  {
    tier: BundleTier.BASIC,
    maxMessages: 10,
    price: 5,
    isUnlimited: false,
  },
  {
    tier: BundleTier.PRO,
    maxMessages: 100,
    price: 10,
    isUnlimited: false,
  },
  {
    tier: BundleTier.ENTERPRISE,
    maxMessages: -1,
    price: 15,
    isUnlimited: true,
  },
];
