import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './models/payment.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';
import { OrdersModule } from '../orders/orders.module';
import { PaymentCreatedListener } from './listeners/payment-created.listener';

@Module({
  imports:[
    MercadoPagoModule,
    OrdersModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PaymentsService, PaymentCreatedListener],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
