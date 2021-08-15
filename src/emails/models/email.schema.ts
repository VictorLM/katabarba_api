import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { EmailTypes } from '../enums/email-types.enum';
import { EmailStatuses } from '../enums/email-statuses.enum';
import { EmailRecipient } from '../interfaces/email-recipient.interface.';

export type EmailDocument = Email & mongoose.Document;

@Schema({ collection: 'emails', timestamps: true })
export class Email {
  @Prop({
    type: EmailRecipient,
    required: true,
  })
  recipient: EmailRecipient;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    default: null,
  })
  relatedTo: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    enum: EmailTypes
  })
  type: EmailTypes;

  @Prop({
    required: false,
    nullable: true,
    default: null,
    enum: Object.values(EmailStatuses).concat([null]), // Para aceitar null
  })
  status: EmailStatuses;

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  resend: Date;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
