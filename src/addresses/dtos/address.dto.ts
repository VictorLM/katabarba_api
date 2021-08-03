import {
  IsString,
  MaxLength,
  IsInt,
  IsOptional,
  IsEnum,
  MinLength,
  IsNotEmpty,
  Matches
} from 'class-validator';
import { AddressState } from '../enums/address-state.enum';

export class AddressDto {
  @IsNotEmpty({ message: 'Campo Rua é obrigatório' })
  @IsString({ message: 'Rua deve conter apenas caracteres comuns' })
  @MinLength(3, { message: 'Rua deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Rua deve ter no máximo $constraint1 caracteres' })
  readonly street: string;

  @IsNotEmpty({ message: 'Campo Número é obrigatório' })
  @IsInt({ message: 'Número inválido' })
  readonly number: number;

  @IsOptional()
  @MinLength(3, { message: 'Complemento deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Complemento deve ter no máximo $constraint1 caracteres' })
  readonly complement: string;

  @IsNotEmpty({ message: 'Campo Nome é obrigatório' })
  @IsString({ message: 'Nome deve conter apenas caracteres comuns' })
  @MinLength(3, { message: 'Cidade deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Cidade deve ter no máximo $constraint1 caracteres' })
  readonly city: string;

  @IsNotEmpty({ message: 'Campo Estado é obrigatório' })
  @IsEnum(AddressState, { message: 'Estado inválido' })
  readonly state: AddressState;

  @IsNotEmpty({ message: 'Campo CEP é obrigatório' })
  @IsString({ message: 'Formato de CEP inválido' })
  @Matches(/^[0-9]{8}$/, { message: 'CEP inválido' })
  readonly zipCode: string;
}
