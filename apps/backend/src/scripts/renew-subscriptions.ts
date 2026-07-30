import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { SubscriptionsService } from "../modules/subscriptions/services/subscriptions.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const subscriptionsService = app.get(SubscriptionsService);

  try {
    const count = await subscriptionsService.processRenewals();
    console.log(`Successfully processed renewals for ${count} subscriptions.`);
  } catch (error) {
    console.error("Error processing renewals:", error);
  } finally {
    await app.close();
  }
}

bootstrap();
