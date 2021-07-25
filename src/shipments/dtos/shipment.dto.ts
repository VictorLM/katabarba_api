import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ProductsIdsAndQuanties } from '../../products/dtos/product.dto';

export class PublicGetShipmentCostsDTO extends ProductsIdsAndQuanties {
  @IsNotEmpty({ message: 'Campo CEP é obrigatório' })
  @IsString({ message: 'Formato de CEP inválido' })
  @Matches(/^[0-9]{8}$/, { message: 'CEP inválido' })
  readonly deliveryZipCode: string;
}
