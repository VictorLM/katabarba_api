import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './models/payment.schema';
import { PaymentsService } from './payments.service';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [PaymentsService]
})
export class PaymentsModule {}
