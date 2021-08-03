import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsInt,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class UserBaseDto {
  @IsNotEmpty({ message: 'Campo Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @MinLength(6, { message: 'Email deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Email deve ter no máximo $constraint1 caracteres' })
  readonly email: string;

  @IsNotEmpty({ message: 'Campo Nome é obrigatório' })
  @IsString({ message: 'Nome inválido. Somente letras.' })
  @MinLength(3, { message: 'Nome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Nome deve ter no máximo $constraint1 caracteres' })
  readonly name: string;

  @IsNotEmpty({ message: 'Campo Sobrenome é obrigatório' })
  @IsString({ message: 'Sobrenome inválido. Somente letras.' })
  @MinLength(3, { message: 'Sobrenome deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Sobrenome deve ter no máximo $constraint1 caracteres' })
  readonly surname: string;

  @IsNotEmpty({ message: 'Campo CPF é obrigatório' })
  @IsInt({ message: 'CPF inválido. Somente números' })
  readonly cpf: number; // TODO - ALGORITMO PARA VALIDAR

  @IsOptional()
  @IsInt({ message: 'Telefone inválido. Somente números' })
  readonly phone: number; // TODO - Validar
}

export class SignUpDto extends UserBaseDto {
  @IsNotEmpty({ message: 'Campo Senha é obrigatório' })
  @IsString({ message: 'Senha deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Senha deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo $constraint1 caracteres'})
  readonly password: string;
}

export class ChangeUserPasswordDto {
  @IsNotEmpty({ message: 'Campo Senha Atual é obrigatório' })
  @IsString({ message: 'Senha Atual deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Senha Atual deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Senha Atual deve ter no máximo $constraint1 caracteres'})
  readonly currentPassword: string;

  @IsNotEmpty({ message: 'Campo Nova Senha é obrigatório' })
  @IsString({ message: 'Nova Senha deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Nova Senha deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Nova Senha deve ter no máximo $constraint1 caracteres'})
  readonly newPassword: string;
}
