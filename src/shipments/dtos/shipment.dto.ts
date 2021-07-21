import { IsNotEmpty, IsString } from 'class-validator';
import { ProductsIdsAndQuanties } from '../../products/dtos/product.dto';

export class PublicGetShipmentCostsDTO extends ProductsIdsAndQuanties {
  @IsNotEmpty({ message: 'Campo CEP é obrigatório' })
  @IsString({ message: 'CEP inválido' })
  readonly deliveryZipCode: string; // TODO - VALIDAR CEP
}
