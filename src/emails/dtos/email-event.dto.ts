import { Types } from 'mongoose';
import { EmailEvents } from '../enums/email-events.enum';

export class CreateEmailEventDTO {
  readonly emailID: Types.ObjectId;
  readonly event: EmailEvents;
  readonly time: Date;
  readonly email: string;
  readonly mjCampaignId: number;
  readonly mjContactID: number;
  readonly customCampaign: string;
  readonly messageID: number;
  readonly messageGUID: string;
  readonly payload: string;
  // SENT
  readonly mjMessageID: string;
  readonly smtpReply: string;
  // OPEN & UNSUB
  readonly ip: string;
  readonly geo: string;
  readonly agent: string;
  // CLICK
  readonly url: string;
  // BOUNCE & BLOCKED
  readonly blocked: boolean;
  readonly hardBounce: boolean;
  readonly errorRelatedTo: string;
  readonly error: string;
  readonly comment: string;
  // SPAM
  readonly source: string;
  // UNSUB
  readonly mjListID: number;
}
