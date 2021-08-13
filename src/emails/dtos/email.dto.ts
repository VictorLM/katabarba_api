import { IsDate, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { EmailTypes } from '../enums/email-types.enum';
import { EmailRecipient } from '../interfaces/email-recipient.interface.';

export class CreateEmailDTO {
  readonly recipient: EmailRecipient;
  readonly type: EmailTypes;
  readonly relatedTo?: Types.ObjectId;
}

// TODO - CLASS VALIDATOR DATE || NULL
export class UpdateEmailDTO {
  @IsNotEmpty({ message: 'Campo Reenviar é obrigatório' })
  @IsDate({ message: 'Campo Reenviar deve ser uma data válida' })
  readonly notResend: Date;
}
