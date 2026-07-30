import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateSubscriptionDto {
  @IsBoolean({ message: "autoRenew must be a boolean" })
  @IsNotEmpty({ message: "autoRenew is required" })
  autoRenew: boolean;
}
