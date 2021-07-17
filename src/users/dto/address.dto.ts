import {
  IsString,
  MaxLength,
  IsInt,
  IsOptional,
  IsEnum,
  MinLength,
  Length
} from 'class-validator';
import { AddressState } from '../models/address-state.enum';

export class AddressDto {
  @IsString({ message: 'Rua deve conter apenas caracteres comuns' })
  @MinLength(3, { message: 'Rua deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Rua deve ter no máximo $constraint1 caracteres' })
  readonly street: string;

  @IsInt({ message: 'Número inválido' })
  readonly number: number;

  @IsOptional()
  @MinLength(3, { message: 'Complemento deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(100, { message: 'Complemento deve ter no máximo $constraint1 caracteres' })
  readonly complement: string;

  @IsString({ message: 'Nome deve conter apenas caracteres comuns' })
  @MinLength(3, { message: 'Cidade deve ter no mínimo $constraint1 caracteres' })
  @MaxLength(50, { message: 'Cidade deve ter no máximo $constraint1 caracteres' })
  readonly city: string;

  @IsEnum(AddressState, { message: 'Estado inválido' })
  readonly state: AddressState;

  @IsString({ message: 'CEP deve conter apenas números' })
  @Length(8, 8, { message: 'CEP deve ter $constraint1 dígitos'})
  readonly zip: string; // TODO - VALIDAR
}
