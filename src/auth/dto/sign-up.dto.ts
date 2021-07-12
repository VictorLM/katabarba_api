import { IsString, IsEmail, MaxLength, MinLength, Matches, Length } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(50, { message: 'Tamanho máximo permitido de $constraint1 caracteres' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Tamanho mínimo permitido de $constraint1 caracteres' })
  @MaxLength(32, { message: 'Tamanho máximo permitido de $constraint1 caracteres' })
  password: string;

  @IsString()
  @MinLength(6, { message: 'Tamanho mínimo permitido de $constraint1 caracteres' })
  @MaxLength(100, { message: 'Tamanho máximo permitido de $constraint1 caracteres' })
  name: string;

  @IsString()
  @Length(14, 14, { message: 'CPF deve ter $constraint1 caracteres' })
  @Matches(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, {
    message: 'CPF inválido',
  })
  cpf: string; // TODO ALGORITMO PARA VALIDAR
}
