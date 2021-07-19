import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/models/user.schema';
import { OrderStatus } from './order-status.enum';
import { Payment } from './payment.type';
import { Shipment } from './shipment.type';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({ required: true })
  products: [{
    product: Types.DocumentArray<any>,
    quantity: number;
  }];
  // Para manter o hitórico de preço dos produtos

  @Prop({ required: true })
  totalPrice: number;
  // Para não precisar ficar calculando

  @Prop({
    type: Shipment,
    required: true
  })
  shipment: Shipment;

  @Prop({
    type: Payment,
    required: false,
    default: null
  })
  payment: Payment;

  @Prop({ required: false,
    enum: OrderStatus,
    default: OrderStatus.AWAITING_PAYMENT
  })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
