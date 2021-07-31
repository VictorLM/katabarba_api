import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsInt,
  IsOptional,
} from 'class-validator';

export class UserBaseDto {
  @IsEmail({}, { message: 'Email inválido' })
  @MinLength(6, { message: 'Email deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Email deve ter no máximo $constraint1 caracteres' })
  readonly email: string;

  @IsString({ message: 'Nome inválido. Somente letras.' })
  @MinLength(3, { message: 'Nome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo $constraint1 caracteres' })
  readonly name: string;

  @IsString({ message: 'Nome inválido. Somente letras.' })
  @MinLength(3, { message: 'Nome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo $constraint1 caracteres' })
  readonly surname: string;

  @IsInt({ message: 'CPF inválido. Somente números' })
  readonly cpf: number; // TODO - ALGORITMO PARA VALIDAR

  @IsOptional()
  @IsInt({ message: 'Telefone inválido. Somente números' })
  readonly phone: number; // TODO - Validar
}

export class SignUpDto extends UserBaseDto {
  @IsString({ message: 'Senha deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Senha deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo $constraint1 caracteres'})
  readonly password: string;
}

export class ChangeUserPasswordDto {
  @IsString({ message: 'Senha Atual deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Senha Atual deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Senha Atual deve ter no máximo $constraint1 caracteres'})
  readonly currentPassword: string;

  @IsString({ message: 'Nova Senha deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Nova Senha deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Nova Senha deve ter no máximo $constraint1 caracteres'})
  readonly newPassword: string;
}
