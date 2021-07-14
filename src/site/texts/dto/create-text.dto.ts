import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTextDto {
  @IsString({ message: 'Seção deve conter apenas caracteres comuns' })
  // TODO - ENUM
  section: string;

  @IsString({ message: 'Título deve conter apenas caracteres comuns' })
  @MinLength(3, { message: 'Título deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Título deve ter no máximo $constraint1 caracteres' })
  title: string;

  @IsString({ message: 'Texto deve conter apenas caracteres comuns' })
  @MinLength(10, { message: 'Texto deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(255, { message: 'Texto deve ter no máximo $constraint1 caracteres' })
  text: string;
}
