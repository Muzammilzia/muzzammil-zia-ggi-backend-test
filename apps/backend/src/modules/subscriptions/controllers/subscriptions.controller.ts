import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { SubscriptionsService } from '../services/subscriptions.service';
import type { Request } from 'express';
import { CreateSubscriptionDto } from '../dtos/create-subscrtiption.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) { }

  @Post('create')
  async create(@Req() req: Request, @Body() dto: CreateSubscriptionDto) {
    const userId = (req as any).user.sub;
    return this.subscriptionsService.createSubscription(userId, dto);
  }

  @Get('bundles')
  async getBundles() {
    return this.subscriptionsService.getBundles();
  }

  @Get()
  async getMySubscriptions(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.subscriptionsService.getSubscriptions(userId);
  }
}
