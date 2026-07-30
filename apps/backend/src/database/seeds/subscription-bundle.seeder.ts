import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { SubscriptionBundle } from "../../modules/subscriptions/domain/entities/subscription-bundle.entity";
import { SUBSCRIPTION_BUNDLE_SEED } from "./subscription-bundles.seed";

@Injectable()
export class SubscriptionBundleSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SubscriptionBundleSeeder.name);

  constructor(
    @InjectRepository(SubscriptionBundle)
    private readonly bundleRepository: Repository<SubscriptionBundle>
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    for (const bundle of SUBSCRIPTION_BUNDLE_SEED) {
      const existing = await this.bundleRepository.findOne({
        where: {
          tier: bundle.tier,
        },
      });

      if (!existing) {
        await this.bundleRepository.save(bundle);

        this.logger.log(`Created ${bundle.tier} bundle`);
        continue;
      }

      existing.maxMessages = bundle.maxMessages;
      existing.price = bundle.price;
      existing.isUnlimited = bundle.isUnlimited;

      await this.bundleRepository.save(existing);

      this.logger.log(`Updated ${bundle.tier} bundle`);
    }

    this.logger.log("Subscription bundles seeded");
  }
}
