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
    default: null,
  })
  user: User;

  @Prop({
    type: Error,
    required: true,
  })
  error: Error;

  @Prop({ required: true })
  action: string;
}

export const AppErrorSchema = SchemaFactory.createForClass(AppError);
