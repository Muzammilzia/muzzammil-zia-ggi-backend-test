import { Controller, Post, Body, Get, Req, Param, Patch } from "@nestjs/common";
import { SubscriptionsService } from "../services/subscriptions.service";
import type { Request } from "express";
import { CreateSubscriptionDto } from "../dtos/create-subscrtiption.dto";
import { UpdateSubscriptionDto } from "../dtos/update-subscription.dto";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post("create")
  async create(@Req() req: Request, @Body() dto: CreateSubscriptionDto) {
    const userId = (req as any).user.sub;
    return this.subscriptionsService.createSubscription(userId, dto);
  }

  @Get("bundles")
  async getBundles() {
    return this.subscriptionsService.getBundles();
  }

  @Get()
  async getMySubscriptions(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionsService.getSubscriptions(userId);
  }

  @Patch(":id")
  async updateSubscription(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateSubscriptionDto
  ) {
    const userId = (req as any).user.sub;
    return this.subscriptionsService.updateSubscription(userId, id, dto);
  }
}
