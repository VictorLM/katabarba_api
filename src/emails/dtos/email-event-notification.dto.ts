// import { Type } from 'class-transformer';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EmailEvents } from '../enums/email-events.enum';

export class EmailEventNotificationDTO {
  @IsNotEmpty()
  @IsEnum(EmailEvents)
  readonly event: EmailEvents;

  @IsNotEmpty()
  @IsNumber()
  readonly time: number;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsNumber()
  readonly mj_campaign_id: number;

  @IsOptional()
  @IsNumber()
  readonly mj_contact_id: number;

  @IsOptional()
  @IsString()
  readonly customcampaign: string;

  @IsNotEmpty()
  @IsNumber()
  readonly MessageID: number;

  @IsOptional()
  @IsNumber()
  readonly Message_GUID: string;

  @IsNotEmpty()
  @IsString()
  readonly CustomID: string;

  @IsOptional()
  @IsString()
  readonly Payload: string;

  @IsOptional()
  @IsString()
  readonly mj_message_id: string;

  @IsOptional()
  @IsString()
  readonly smtp_reply: string;

  @IsOptional()
  @IsString()
  readonly ip: string;

  @IsOptional()
  @IsString()
  readonly geo: string;

  @IsOptional()
  @IsString()
  readonly agent: string;

  @IsOptional()
  @IsString()
  readonly url: string;

  @IsOptional()
  @IsBoolean()
  readonly blocked: boolean;

  @IsOptional()
  @IsBoolean()
  readonly hard_bounce: boolean;

  @IsOptional()
  @IsString()
  readonly error_related_to: string;

  @IsOptional()
  @IsString()
  readonly error: string;

  @IsOptional()
  @IsString()
  readonly comment: string;

  @IsOptional()
  @IsString()
  readonly source: string;

  @IsOptional()
  @IsNumber()
  readonly mj_list_id: number;
}

export class EmailEventsNotificationDTO extends Array { // Estava dando problema no forEach
  @ValidateNested({ each: true })
  @Type(() => EmailEventNotificationDTO)
  list: EmailEventNotificationDTO[];
}
