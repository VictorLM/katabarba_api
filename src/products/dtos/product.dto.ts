import { IsString, Min, IsNotEmpty, Max, IsInt, ValidateNested, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDocument } from '../models/product.schema';
import { Types } from 'mongoose';

export class ProductsIdsAndQuanties {
  @IsNotEmpty({ message: 'Campo Produtos é obrigatório' })
  @IsArray({ message: 'Formato dos Produtos inválido' })
  @ArrayMinSize(1, { message: 'Pedido deve conter ao menos um Produto' })
  @ArrayMaxSize(5, { message: 'Pedido deve conter no máximo cinco Produtos' })
  @ValidateNested({ each: true })
  @Type(() => ProductOrder)
  readonly productsIdsAndQuanties: ProductOrder[];
}

class ProductQuantity{
  @IsNotEmpty({ message: 'Campo Quantidade é obrigatório para todos os Produtos' })
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Cada Produto deve ter uma Quantidade mínima de um' })
  @Max(5, { message: 'Cada Produto deve ter uma Quantidade máxima de cinco' }) // TODO - FALAR C/ JOW
  quantity: number;
}

export class ProductOrder extends ProductQuantity {
  @IsNotEmpty({ message: 'Campo ID dos Produtos é obrigatório' })
  @IsString({ message: 'ID do produto inválido' })
  readonly productId: Types.ObjectId;
}

export class ProductFullOrder extends ProductQuantity {
  readonly product: ProductDocument;
}
