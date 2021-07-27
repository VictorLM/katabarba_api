import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from '../../orders/models/order.schema';
import { PaymentStatuses } from '../enums/payment-statuses.enum';

export type PaymentDocument = Payment & Document;

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
  })
  order: Order;

  @Prop({ required: true })
  mpId: string; // Mercado Pago ID

  @Prop({
    required: true,
    enum: PaymentStatuses,
  })
  status: PaymentStatuses; // Date > updatedAt

  @Prop({ required: true }) // TODO - ENUM
  method: string;

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
