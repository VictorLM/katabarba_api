import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Payment } from '../../payments/models/payment.schema';
import { ProductDocument } from '../../products/models/product.schema';
import { Shipment } from '../../shipments/models/shipment.schema';
import { User } from '../../users/models/user.schema';
import { OrderStatuses } from './order-statuses.enum';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({ required: false, default: null })
  mpPreferenceId: string; // Mercado Pago Preference ID

  @Prop({ required: true })
  productsAndQuantities: [{
    product: Types.DocumentArray<ProductDocument>,
    quantity: number;
  }];
  // Para manter o hitórico de preço dos produtos

  @Prop({
    type: Types.ObjectId,
    ref: 'Shipment',
    required: true,
  })
  shippment: Shipment;

  @Prop({ required: true })
  totalPrice: number;
  // Para não precisar ficar calculando

  @Prop({
    type: Types.ObjectId,
    ref: 'Payment',
    required: false,
    default: null,
  })
  payment: Payment;

  @Prop({ required: false,
    enum: OrderStatuses,
    default: OrderStatuses.AWAITING_PAYMENT
  })
  status: OrderStatuses;

  @Prop({ required: false })
  notes: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
