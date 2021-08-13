import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { EmailEvents } from '../enums/email-events.enum';
import { Email } from './email.schema';

export type EmailEventDocument = EmailEvent & mongoose.Document;

@Schema({ collection: 'emailEvents', timestamps: true })
export class EmailEvent {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: true,
  })
  emailID: Email;

  @Prop({
    required: true,
    enum: EmailEvents
  })
  event: EmailEvents;

  @Prop({ required: true })
  time: Date;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  mjCampaignId: number;

  @Prop({ required: false })
  mjContactID: number;

  @Prop({ required: false })
  customCampaign: string;

  @Prop({ required: true })
  messageID: number;

  @Prop({ required: false })
  messageGUID: string;

  @Prop({ required: false })
  payload: string;

  // SENT
  @Prop({ required: false })
  mjMessageID: string;

  @Prop({ required: false })
  smtpReply: string;

  // OPEN & UNSUB
  @Prop({ required: false })
  ip: string;

  @Prop({ required: false })
  geo: string;

  @Prop({ required: false })
  agent: string;

  // CLICK
  @Prop({ required: false })
  url: string;

  // BOUNCE & BLOCKED
  @Prop({ required: false })
  blocked: boolean;

  @Prop({ required: false })
  hardBounce: boolean;

  @Prop({ required: false })
  errorRelatedTo: string;

  @Prop({ required: false })
  error: string;

  @Prop({ required: false })
  comment: string;

  // SPAM
  @Prop({ required: false })
  source: string;

  // UNSUB
  @Prop({ required: false })
  mjListID: number;
}

export const EmailEventSchema = SchemaFactory.createForClass(EmailEvent);
