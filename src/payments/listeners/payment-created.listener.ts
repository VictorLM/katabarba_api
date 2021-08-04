import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PaymentCreatedEvent } from '../events/payment.events';

@Injectable()
export class PaymentCreatedListener {
  @OnEvent('payment.created')
  handlePaymentCreatedEvent(payment: PaymentCreatedEvent) {
    console.log(payment.payment);
  }
}
