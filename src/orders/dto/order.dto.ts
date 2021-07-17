import { IsNotEmpty, IsDate, IsString, IsOptional, IsInt, IsPositive, Min } from 'class-validator';
import { ProductDocument } from '../../products/models/product.schema';
// import { ShippingCompanies } from '../models/shipping-companies.enum';
// import { OrderStatus } from '../models/order-status.enum';

class QuantityType {
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @IsPositive({ message: 'Quantidade deve ser um número maior que zero' })
  @Min(1)
  readonly quantity: number;
}

export class ProductOrderType extends QuantityType {
  @IsString({ message: 'ID do produto inválido' })
  readonly productId: string;
}

export class ProductFullOrderType extends QuantityType {
  @IsNotEmpty()
  readonly product: ProductDocument;
}

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Compra deve conter ao menos um produto' })
  readonly products: ProductOrderType[];
  // Campos abaixo não serão preenchidos pelo usuário
  // Por isso não necessitam de validação
  // readonly shipAddress: Document;
  // readonly shippingTax: number;
  // readonly shippingCompany: ShippingCompanies;
  // readonly status: OrderStatus;
  // readonly totalPrice: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsDate({ message: 'Data do Pagamento deve conter data e hora válidas' })
  readonly payed: Date;

  @IsOptional()
  @IsDate({ message: 'Data do Envio deve conter data e hora válidas' })
  readonly shipped: Date;

  @IsOptional()
  @IsString({ message: 'Código de Rastreio deve conter apenas caracteres comuns' })
  readonly trackingCode: string;
}
