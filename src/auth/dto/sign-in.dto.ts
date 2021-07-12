import { IsString, IsEmail, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(50, { message: 'Tamanho máximo permitido de $constraint1 caracteres' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Tamanho mínimo permitido de $constraint1 caracteres' })
  @MaxLength(32, { message: 'Tamanho máximo permitido de $constraint1 caracteres' })
  password: string;
}
