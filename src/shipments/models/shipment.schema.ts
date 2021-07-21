import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from '../../orders/models/order.schema';
import { Address, AddressDocument } from '../../addresses/models/address.schema';
import { ShipmentStatus, ShippingCompanies, ShippingTypes } from './shipment.types';

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

  @Prop({ required: false })
  cost: number;

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
