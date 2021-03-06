import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './models/payment.schema';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';
import { OrdersModule } from '../orders/orders.module';
import { ErrorsModule } from '../errors/errors.module';

@Module({
  imports:[
    ErrorsModule,
    MercadoPagoModule,
    OrdersModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
  controllers: [PaymentsController]
})
export class PaymentsModule {}
