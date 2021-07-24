import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from '../../orders/models/order.schema';
import { Address, AddressDocument } from '../../addresses/models/address.schema';
import { ShippingCompanies } from '../enums/shipping-companies.enum';
import { ShippingTypes } from '../enums/shipping-types.enum';
import { ShipmentStatus } from '../interfaces/shipping-status.interface';

export type ShipmentDocument = Shipment & Document;

@Schema({ collection: 'shipments', timestamps: true })
export class Shipment {
  @Prop({
    type: Types.ObjectId,
    ref: 'Order',
    required: true,
  })
  order: Order;

  @Prop({
    type: Types.ObjectId,
    ref: 'Address',
    required: true,
  })
  shiptAddress: Address;

  @Prop({ required: true })
  deliveryAddress: Types.DocumentArray<AddressDocument>;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  deadline: number; // days

  @Prop({
    required: true,
    enum: ShippingCompanies,
  })
  company: ShippingCompanies;

  @Prop({
    required: true,
    enum: ShippingTypes,
  })
  type: ShippingTypes;

  @Prop({ required: false, default: null })
  shipped: Date;

  @Prop({ required: false, default: null })
  trackingCode: string;

  @Prop({ required: false, default: null })
  statuses: ShipmentStatus[];
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
