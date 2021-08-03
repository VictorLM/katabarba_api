import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/models/user.schema';

export type TextDocument = Text & mongoose.Document;

@Schema({ collection: 'texts', timestamps: true })
export class Text {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;
}

export const TextSchema = SchemaFactory.createForClass(Text);
