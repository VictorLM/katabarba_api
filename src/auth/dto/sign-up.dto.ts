import {
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsInt,
  IsMobilePhone,
  IsOptional,
} from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(50, {
    message: 'Tamanho máximo permitido de $constraint1 caracteres',
  })
  readonly email: string;

  @IsString()
  @MinLength(6, {
    message: 'Tamanho mínimo permitido de $constraint1 caracteres',
  })
  @MaxLength(32, {
    message: 'Tamanho máximo permitido de $constraint1 caracteres',
  })
  readonly password: string;

  @IsString({ message: 'Nome inválido. Somente letras.' })
  @MinLength(6, {
    message: 'Tamanho mínimo permitido de $constraint1 caracteres',
  })
  @MaxLength(100, {
    message: 'Tamanho máximo permitido de $constraint1 caracteres',
  })
  readonly name: string;

  @IsInt({ message: 'CPF inválido. Somente números' })
  // @Length(11, 11, { message: 'CPF deve ter $constraint1 dígitos' })
  readonly cpf: number; // TODO - ALGORITMO PARA VALIDAR

  @IsOptional()
  @IsMobilePhone('pt-BR')
  readonly phone: number;
}
