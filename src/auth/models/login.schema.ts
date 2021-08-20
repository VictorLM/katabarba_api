import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/models/user.schema';
import { LoginResult } from '../enums/login-result.enum';

export type LoginDocument = Login & mongoose.Document;

@Schema({ collection: 'logins', timestamps: true })
export class Login {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({
    required: false,
    default: null,
  })
  ip: string;

  @Prop({
    required: false,
    default: null,
   })
  agent: string;

  @Prop({
    required: true,
    enum: LoginResult
  })
  result: LoginResult;
}

export const LoginSchema = SchemaFactory.createForClass(Login);
