import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/models/user.schema';
import { OrderStatus } from './order-status.enum';
import { ShippingCompanies } from './shipping-companies.enum';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
  @Prop({
    type: Types.ObjectId, ref: 'User',
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
  shipAddress: Types.DocumentArray<any>;
  // Para manter o hitórico do endereço

  @Prop({ required: true })
  totalPrice: number;
  // Para não precisar ficar calculando

  @Prop({ required: false, default: null })
  payed: Date;

  @Prop({ required: true })
  shippingTax: number;

  @Prop({ required: true, enum: ShippingCompanies })
  shippingCompany: ShippingCompanies;

  @Prop({ required: false, default: null })
  shipped: Date;

  @Prop({ required: false, enum: OrderStatus, default: OrderStatus.AWAITING_PAYMENT })
  status: OrderStatus;

  @Prop({ required: false, default: null })
  trackingCode: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
