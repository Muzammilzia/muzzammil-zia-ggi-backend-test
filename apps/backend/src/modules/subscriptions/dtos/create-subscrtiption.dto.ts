import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateSubscriptionDto {
    @IsUUID(undefined, { message: 'bundleId must be a valid UUID' })
    @IsNotEmpty({ message: 'bundleId is required' })
    bundleId: string;

    @IsBoolean({ message: 'isYearly must be a boolean' })
    isYearly: boolean;

    @IsBoolean({ message: 'autoRenew must be a boolean' })
    autoRenew: boolean;
}