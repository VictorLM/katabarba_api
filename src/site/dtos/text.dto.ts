import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTextDto {
  @IsNotEmpty({ message: 'Campo Seção é obrigatório' })
  @IsString({ message: 'Seção deve conter apenas caracteres comuns' })
  // TODO - ENUM
  section: string;

  @IsNotEmpty({ message: 'Campo Título é obrigatório' })
  @IsString({ message: 'Título deve conter apenas caracteres comuns' })
  @MinLength(3, { message: 'Título deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Título deve ter no máximo $constraint1 caracteres' })
  title: string;

  @IsNotEmpty({ message: 'Campo texto é obrigatório' })
  @IsString({ message: 'Texto deve conter apenas caracteres comuns' })
  @MinLength(10, { message: 'Texto deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(255, { message: 'Texto deve ter no máximo $constraint1 caracteres' })
  text: string;
}
