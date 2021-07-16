import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export type AddressDocument = Address & Document;

@Schema({ collection: 'addresses', timestamps: true })
export class Address {
  @Prop({ required: true })
  street: string;

  @Prop({ required: true })
  number: number;

  @Prop()
  complement: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  zip: string;

  @Prop({
    type: Types.ObjectId, ref: 'User',
    required: true,
  })
  user: User;
}

export const AddressSchema = SchemaFactory.createForClass(Address);