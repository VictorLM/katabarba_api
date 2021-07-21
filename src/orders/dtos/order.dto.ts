import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShippingCompanies, ShippingTypes } from '../models/shipment.type';
import { ProductsIdsAndQuanties } from '../../products/dtos/product.dto';

export class CreateOrderDto extends ProductsIdsAndQuanties {
  @IsNotEmpty({ message: 'Campo Transportadora é obrigatório' })
  @IsEnum(ShippingCompanies, { message: 'Transportadora inválida' })
  readonly shippingCompany: ShippingCompanies;

  @IsNotEmpty({ message: 'Campo Tipo de Frete é obrigatório' })
  @IsEnum(ShippingTypes, { message: 'Tipo de Frete inválido' })
  readonly shippingType: ShippingTypes;

  // Campos abaixo não serão preenchidos pelo usuário
  // Por isso não necessitam de validação
  // readonly shipAddress: Document;
  // readonly shippingTax: number;
  // readonly shippingCompany: ShippingCompanies;
  // readonly status: OrderStatus;
  // readonly totalPrice: number;
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
