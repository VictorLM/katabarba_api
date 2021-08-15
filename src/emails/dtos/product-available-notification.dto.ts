import { IsEmail, IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductAvailableNotificationDTO {
  @IsNotEmpty({ message: 'Campo Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  readonly email: string;

  @IsNotEmpty({ message: 'Campo Produto é obrigatório' })
  @IsMongoId({ message: 'Produto inválido' })
  readonly product: Types.ObjectId;
}
