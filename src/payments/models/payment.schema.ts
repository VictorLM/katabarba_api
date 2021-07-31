import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from '../../orders/models/order.schema';
import { PaymentStatuses } from '../enums/payment-statuses.enum';
import { PaymentTypeIds } from '../enums/payment-type-ids.enum';

export type PaymentDocument = Payment & Document;

@Schema({ collection: 'payments', timestamps: true })
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
  })
  order: Order; // MP Preference external_reference

  @Prop({ required: true })
  mpId: string; // Mercado Pago ID

  @Prop({
    required: true,
    enum: PaymentStatuses,
  })
  status: PaymentStatuses; // Date > updatedAt

  @Prop({ required: false, default: null })
  statusDetail: string;

  @Prop({ required: false, default: null })
  description: string;

  @Prop({ required: false, default: null })
  approvedAt: Date;

  @Prop({ required: true })
  expiresIn: Date;

  @Prop({ required: false, default: null })
  moneyReleaseDate: Date;

  @Prop({
    required: true,
    enum: PaymentTypeIds,
  })
  paymentTypeId: PaymentTypeIds;

  @Prop({ required: true })
  transactionAmount: number;

}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
