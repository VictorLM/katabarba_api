import { Module } from '@nestjs/common';
import { EmailsModule } from '../emails/emails.module';
import { ErrorsModule } from '../errors/errors.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { CronService } from './cron.service';

@Module({
  imports: [
    EmailsModule,
    ErrorsModule,
    UsersModule,
    ProductsModule,
    PaymentsModule,
    OrdersModule,
  ],
  providers: [CronService]
})
export class CronModule {}
