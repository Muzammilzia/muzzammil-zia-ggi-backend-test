import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { BundleTier, SubscriptionBundle } from "../domain/entities/subscription-bundle.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSubscription } from "../domain/entities/user-subscription.entity";
import { CreateSubscriptionDto } from "../dtos/create-subscrtiption.dto";
import { UpdateSubscriptionDto } from "../dtos/update-subscription.dto";

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(SubscriptionBundle)
    private readonly subscriptionBundlesRepository: Repository<SubscriptionBundle>,

    @InjectRepository(UserSubscription)
    private readonly userSubscriptionsRepository: Repository<UserSubscription>
  ) {}

  private addMonthsClamped(date: Date, monthsToAdd: number): Date {
    const day = date.getDate();
    const targetMonthDate = new Date(date.getFullYear(), date.getMonth() + monthsToAdd, 1);

    // Last valid day of the target month (handles Feb 28/29, 30-day months)
    const lastDayOfTargetMonth = new Date(
      targetMonthDate.getFullYear(),
      targetMonthDate.getMonth() + 1,
      0
    ).getDate();

    targetMonthDate.setDate(Math.min(day, lastDayOfTargetMonth));
    return targetMonthDate;
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const bundle = await this.subscriptionBundlesRepository.findOne({
      where: { id: dto.bundleId },
    });

    if (!bundle) {
      throw new Error("Bundle not found");
    }

    const startDate = new Date();
    const endDate = this.addMonthsClamped(startDate, 1);
    const renewalDate = this.addMonthsClamped(startDate, dto.isYearly ? 12 : 1);

    const subscription = this.userSubscriptionsRepository.create({
      userId,
      bundleId: bundle.id,
      startDate,
      endDate,
      renewalDate,
      autoRenew: dto.autoRenew,
      isYearly: dto.isYearly,
    });

    return await this.userSubscriptionsRepository.save(subscription);
  }

  async addFreeSubscriptionToUser(userId: string) {
    const bundle = await this.subscriptionBundlesRepository.findOne({
      where: {
        tier: BundleTier.FREE,
      },
    });

    if (!bundle) {
      throw new Error("Free bundle not found");
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
    const renewalDate = endDate;

    const userSubscription = this.userSubscriptionsRepository.create({
      userId,
      bundleId: bundle.id,
      startDate,
      endDate,
      renewalDate,
    });

    return await this.userSubscriptionsRepository.save(userSubscription);
  }

  async consumeQouta(userId: string) {
    const subscriptions = await this.userSubscriptionsRepository.find({
      where: { userId, isActive: true },
      relations: { bundle: true },
      order: { startDate: "DESC" },
    });

    const subscriptionToConsume = subscriptions.find((s) => s.bundle.tier === BundleTier.FREE);

    if (subscriptionToConsume) {
      if (subscriptionToConsume.bundle.maxMessages > subscriptionToConsume.usedQouta) {
        subscriptionToConsume.usedQouta++;
        return await this.userSubscriptionsRepository.save(subscriptionToConsume);
      }
    }

    for (const s of subscriptions) {
      if (s.bundle.maxMessages > s.usedQouta || s.bundle.isUnlimited) {
        s.usedQouta++;
        return await this.userSubscriptionsRepository.save(s);
      }
    }

    throw new BadRequestException("Qouta limit reached");
  }

  async getBundles() {
    return await this.subscriptionBundlesRepository.find();
  }

  async getSubscriptions(userId: string) {
    return await this.userSubscriptionsRepository.find({
      where: { userId },
      relations: { bundle: true },
      order: { startDate: "DESC" },
    });
  }
  async updateSubscription(userId: string, id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.userSubscriptionsRepository.findOne({
      where: { id, userId },
    });

    if (!subscription) {
      throw new BadRequestException("Subscription not found");
    }

    subscription.autoRenew = dto.autoRenew;

    return await this.userSubscriptionsRepository.save(subscription);
  }

  async processRenewals() {
    const now = new Date();

    const subscriptions = await this.userSubscriptionsRepository.find({
      where: {
        isActive: true,
      },
    });

    const modifiedSubscriptions: UserSubscription[] = [];

    for (const sub of subscriptions) {
      if (sub.autoRenew) {
        sub.startDate = sub.renewalDate;
        sub.endDate = this.addMonthsClamped(sub.startDate, 1);
        sub.renewalDate = this.addMonthsClamped(sub.startDate, sub.isYearly ? 12 : 1);
        sub.usedQouta = 0;
        modifiedSubscriptions.push(sub);
      } else {
        const expirationDate = new Date(sub.renewalDate);
        if (now >= expirationDate) {
          sub.isActive = false;
          modifiedSubscriptions.push(sub);
        }
      }
    }

    if (modifiedSubscriptions.length > 0) {
      await this.userSubscriptionsRepository.save(modifiedSubscriptions);
    }

    return modifiedSubscriptions.length;
  }
}
