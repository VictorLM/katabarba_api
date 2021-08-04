import { PaymentDocument } from "../models/payment.schema";

export class PaymentCreatedEvent {
  payment: PaymentDocument;

  constructor(payment) {
    this.payment = payment;
  }
}
