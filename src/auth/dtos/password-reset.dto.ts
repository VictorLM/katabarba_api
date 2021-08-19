import { IsEmail, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { PasswordDto } from '../../users/dtos/user.dto';
import { User } from '../../users/models/user.schema';

export class NewPasswordResetTokenDTO {
  @IsNotEmpty({ message: 'Campo Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  readonly email: string;
}

export class CreatePasswordResetTokenDTO {
  readonly user: User;
  readonly token: string;
}

export class PasswordResetDTO extends PasswordDto {
  @IsNotEmpty({ message: 'Usuário é obrigatório' })
  @IsMongoId({ message: 'Usuário inválido' })
  readonly userId: Types.ObjectId;

  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString({ message: 'Token inválido' })
  readonly token: string;
}
