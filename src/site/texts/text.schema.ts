import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TextDocument = Text & Document;

@Schema({ collection: 'texts', timestamps: true })
export class Text {
  @Prop({ required: true })
  section: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  text: string;
}

export const TextSchema = SchemaFactory.createForClass(Text);
