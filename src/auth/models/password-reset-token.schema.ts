import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/models/user.schema';

export type PasswordResetTokenDocument = PasswordResetToken & mongoose.Document;

@Schema({ collection: 'passwordResetTokens' })
export class PasswordResetToken {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({ required: true })
  token: string;

  @Prop({
    required: false,
    default: Date.now,
    index: { expires: '1h' }, // To self-delete after one hour
  })
  createdAt: Date;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(PasswordResetToken);
