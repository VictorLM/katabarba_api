import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/models/user.schema';

export type AppErrorDocument = AppError & mongoose.Document;

@Schema({ collection: 'errors', timestamps: true })
export class AppError {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  })
  user: User;

  @Prop({
    type: {},
    required: true,
  })
  error: any;

  @Prop({ required: true })
  action: string;

  @Prop({
    type: {},
    required: false,
  })
  model: any;

  @Prop({ required: false, default: null })
  checked: Date;

  @Prop({ required: false, default: null })
  notes: string;
}

export const AppErrorSchema = SchemaFactory.createForClass(AppError);
