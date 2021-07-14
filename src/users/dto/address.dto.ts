import { IsString, MaxLength, Length, IsPostalCode, IsInt, IsOptional, IsEnum } from 'class-validator';
import { AddressState } from '../models/address-state.enum';

export class AddressDto {
  @IsString({ message: 'Rua deve ser conter letras' })
  @MaxLength(100, {
    message: 'Tamanho máximo permitido de $constraint1 caracteres',
  })
  readonly street: string;

  @IsInt({ message: 'Número inválido' })
  readonly number: number;

  @IsOptional()
  @MaxLength(100, {
    message: 'Tamanho máximo permitido de $constraint1 caracteres',
  })
  readonly complement: string;

  @IsString({ message: 'Nome inválido. Somente letras.' })
  @Length(3, 50, {
    message: 'Cidade deve ter entre $constraint1 e $constraint2 caracteres',
  })
  readonly city: string;

  @IsEnum(AddressState, {
    message: 'Estado inválido',
  })
  readonly state: string;

  @IsPostalCode('BR', {
    message: 'CEP inválido',
  })
  readonly zip: string;
}
