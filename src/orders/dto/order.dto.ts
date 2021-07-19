import { IsString, Min, ValidateNested, IsArray, ArrayMinSize, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDocument } from '../../products/models/product.schema';
import { ShippingCompanies, ShippingTypes } from '../models/shipment.type';

class QuantityType {
  @IsNotEmpty({ message: 'Campo Quantidade é obrigatório para todos os Produtos' })
  @Min(1, { message: 'Quantidade deve ser um número inteiro maior que zero' })
  readonly quantity: number;
}

export class ProductOrderType extends QuantityType {
  @IsNotEmpty({ message: 'Campo ID dos Produtos é obrigatório' })
  @IsString({ message: 'ID do produto inválido' })
  readonly productId: string;
}

export class ProductFullOrderType extends QuantityType {
  readonly product: ProductDocument;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Campo Produtos é obrigatório' })
  @IsArray({ message: 'Formato dos Produtos inválido' })
  @ArrayMinSize(1, { message: 'Pedido deve conter ao menos um item' })
  @ValidateNested({ each: true })
  @Type(() => ProductOrderType)
  readonly products: ProductOrderType[];

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

  // @IsOptional()
  // @IsEnum(OrderStatus)
  // readonly status: OrderStatus;
}
