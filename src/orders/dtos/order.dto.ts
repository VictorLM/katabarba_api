import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductsIdsAndQuanties } from '../../products/dtos/product.dto';
import { ShippingCompanies } from '../../shipments/enums/shipping-companies.enum';
import { ShippingTypes } from '../../shipments/enums/shipping-types.enum';

export class CreateOrderDto extends ProductsIdsAndQuanties {
  @IsNotEmpty({ message: 'Campo Transportadora é obrigatório' })
  @IsEnum(ShippingCompanies, { message: 'Transportadora inválida' })
  readonly shippingCompany: ShippingCompanies;

  @IsNotEmpty({ message: 'Campo Tipo de Frete é obrigatório' })
  @IsEnum(ShippingTypes, { message: 'Tipo de Frete inválido' })
  readonly shippingType: ShippingTypes;
}

// Acho que não será necessário DTO para atualizar
// Porque não ter atualização manual
// Por enquanto
export class UpdateOrderDto {
  // readonly Payment: Payment;
  // readonly Shipment: Shipment;
  // readonly notes: string;

  // @IsOptional()
  // @IsEnum(OrderStatus)
  // readonly status: OrderStatus;
}
