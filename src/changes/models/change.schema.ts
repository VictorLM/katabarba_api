import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/models/user.schema';

export type ChangeDocument = Change & Document;

@Schema({ collection: 'changes', timestamps: true })
export class Change {
  @Prop({ required: true })
  collectionName: string; // Can't use 'collection' only

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  before: Types.DocumentArray<any>;

  @Prop({
    type: Types.ObjectId, ref: 'User',
    required: true,
  })
  user: User;
}

export const ChangeSchema = SchemaFactory.createForClass(Change);
