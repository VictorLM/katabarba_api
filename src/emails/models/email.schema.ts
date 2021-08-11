import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from '../../users/models/user.schema';
import { MailTypes } from '../enums/mail-types.enum';
import { MailStatuses } from '../enums/mail-statuses.enum';

export type EmailDocument = Email & mongoose.Document;

@Schema({ collection: 'emails', timestamps: true })
export class Email {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  recipient: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null,
  })
  relatedTo: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    enum: MailTypes
  })
  type: MailTypes;

  @Prop({
    required: false,
    nullable: true,
    default: null,
    enum: Object.values(MailStatuses).concat([null]), // Para aceitar null
  })
  status: MailStatuses;

  @Prop({
    type: {},
    required: false,
    default: null,
  })
  details: any;

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  notResend: Date;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
