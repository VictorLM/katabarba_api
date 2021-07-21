import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Address } from '../../../addresses/models/address.schema';
import { Social } from './social.type';

export type CompanyDocument = Company & Document;

@Schema({ collection: 'companies', timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cnpj: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false, default: null })
  mobile: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  logo: string; // Image URL

  @Prop({ required: false, default: null })
  isShippingOrigin: Date;

  @Prop({ required: false, default: null })
  main: Date;

  @Prop({ required: false, default: null })
  inactive: Date;

  @Prop({
    type: Social,
    required: false,
    default: null,
  })
  social: Social;

  @Prop({
    type: Types.ObjectId,
    ref: 'Address',
    required: true,
  })
  address: Address;

}

export const CompanySchema = SchemaFactory.createForClass(Company);
