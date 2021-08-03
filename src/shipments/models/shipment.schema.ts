import { Prop,  Schema, SchemaFactory,  } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Address, AddressDocument } from '../../addresses/models/address.schema';
import { ShippingCompanies } from '../enums/shipping-companies.enum';
import { ShippingTypes } from '../enums/shipping-types.enum';
import { ShipmentStatus } from '../interfaces/shipping-status.interface';

export type ShipmentDocument = Shipment & mongoose.Document;

@Schema({ collection: 'shipments', timestamps: true })
export class Shipment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  })
  shiptAddress: Address;

  @Prop({ required: true })
  deliveryAddress: mongoose.Types.DocumentArray<AddressDocument>;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  deadline: number; // days

  @Prop({
    required: true,
    enum: ShippingCompanies,
  })
  company: ShippingCompanies;

  @Prop({ required: true })
  type: ShippingTypes;

  @Prop({ required: false, default: null })
  shipped: Date;

  @Prop({ required: false, default: null })
  trackingCode: string;

  @Prop({ required: false, default: null })
  statuses: ShipmentStatus[];
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);
