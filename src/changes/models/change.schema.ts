import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/models/user.schema';

export type ChangeDocument = Change & mongoose.Document;

@Schema({ collection: 'changes', timestamps: true })
export class Change {
  @Prop({ required: true })
  collectionName: string; // Can't use 'collection' only

  @Prop({ required: true })
  type: string;

  @Prop({
    type: {},
    required: true,
  })
  before: any;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;
}

export const ChangeSchema = SchemaFactory.createForClass(Change);
