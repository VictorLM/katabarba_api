import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Address } from '../../addresses/models/address.schema';
import { SocialLinks } from '../interfaces/social-links.interface';

export type CompanyDocument = Company & mongoose.Document;

@Schema({ collection: 'companies', timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cnpj: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  mobile: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  logo: string; // Image URL

  @Prop({ required: false })
  isShippingOrigin: Date;

  @Prop({ required: false })
  main: Date;

  @Prop({ required: false })
  inactive: Date;

  @Prop({
    required: false,
    default: null,
  })
  social: [SocialLinks];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  })
  address: Address;

}

export const CompanySchema = SchemaFactory.createForClass(Company);
