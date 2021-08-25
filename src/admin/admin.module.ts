import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EmailsModule } from '../emails/emails.module';
import { ErrorsModule } from '../errors/errors.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    EmailsModule,
    ErrorsModule,
    UsersModule,
    ProductsModule,
    PaymentsModule,
    OrdersModule,
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
