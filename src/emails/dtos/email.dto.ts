import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { User } from '../../users/models/user.schema';
import { MailTypes } from '../enums/mail-types.enum';

export class CreateEmailDTO {
  @IsNotEmpty()
  readonly recipient: User;

  @IsNotEmpty()
  @IsEnum(MailTypes)
  readonly type: MailTypes;

  @IsOptional()
  @IsMongoId()
  readonly relatedTo: Types.ObjectId;
}

// TODO - CLASS VALIDATOR DATE || NULL
export class UpdateEmailDTO {
  @IsNotEmpty({ message: 'Campo Reenviar é obrigatório' })
  @IsDate({ message: 'Campo Reenviar deve ser uma data válida' })
  readonly notResend: Date;
}
