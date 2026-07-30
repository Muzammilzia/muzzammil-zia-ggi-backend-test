import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionBundle } from './domain/entities/subscription-bundle.entity';
import { UserSubscription } from './domain/entities/user-subscription.entity';
import { SubscriptionsService } from './services/subscriptions.service';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { SubscriptionBundleSeeder } from 'src/database/seeds/subscription-bundle.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionBundle, UserSubscription])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionBundleSeeder],
  exports: [SubscriptionsService]
})
export class SubscriptionsModule { }
