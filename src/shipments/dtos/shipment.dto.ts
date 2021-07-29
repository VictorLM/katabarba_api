import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { AddressDocument } from '../../addresses/models/address.schema';
import { ProductFullOrder, ProductsIdsAndQuanties } from '../../products/dtos/product.dto';
import { ShippingCompanies } from '../enums/shipping-companies.enum';
import { ShippingTypes } from '../enums/shipping-types.enum';

export class PublicGetShipmentCostsDTO extends ProductsIdsAndQuanties {
  @IsNotEmpty({ message: 'Campo CEP é obrigatório' })
  @IsString({ message: 'Formato de CEP inválido' })
  @Matches(/^[0-9]{8}$/, { message: 'CEP inválido' })
  readonly deliveryZipCode: string;
}

// Sem validação porque já vem validado do OrderService
export class CreateShipmentDTO {
  readonly deliveryAddress: AddressDocument;
  readonly shippingCompany: ShippingCompanies;
  readonly shippingType: ShippingTypes;
  readonly productsAndQuantities: ProductFullOrder[];
}
