import { IsString, IsEmail, MaxLength, MinLength, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsNotEmpty({ message: 'Campo Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  @MinLength(6, { message: 'Email deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Email deve ter no máximo $constraint1 caracteres' })
  readonly email: string;

  @IsNotEmpty({ message: 'Campo Senha é obrigatório' })
  @IsString({ message: 'Senha deve conter apenas caracteres comuns' })
  @MinLength(6, { message: 'Senha deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(32, { message: 'Senha deve ter no máximo $constraint1 caracteres'})
  readonly password: string;
}
