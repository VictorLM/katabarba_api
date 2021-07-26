import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductFullOrder, ProductOrder } from './dtos/product.dto';
import { Product, ProductDocument } from './models/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
  ) {}

  async getAllProducts(): Promise<ProductDocument[]> {
    return this.productsModel.find();
    // TODO - ORDER BY AVAILIBLE TRUE AND STOCK > 0
  }

  async getInStockAndAvailableProducts(): Promise<ProductDocument[]> {
    return this.productsModel.find({
      available: true,
      stock: { $gt: 0 },
    });
  }

  async getProductById(id: Types.ObjectId): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de produto "${id}" inválido`);
    }

    const found = await this.productsModel.findById(id);

    if (!found) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }
    return found;
  }


  async getProductsAndQuantitiesById(
    productsIdsAndQuanties: ProductOrder[],
  ): Promise<ProductFullOrder[]> {
    const normalizedProductsIdsAndQuanties =
      this.normalizeProductsIdsAndQuantiesArray(productsIdsAndQuanties);

    const productsAndQuanties: ProductFullOrder[] = await Promise.all(
      normalizedProductsIdsAndQuanties.map(async (product) => ({
        product: await this.getProductById(product.productId),
        quantity: product.quantity,
      })),
    );

    return productsAndQuanties;
  }


  normalizeProductsIdsAndQuantiesArray(
    productsIdsAndQuanties: ProductOrder[],
  ): ProductOrder[] {
    const normalizedProductsIdsAndQuanties: ProductOrder[] = [];

    productsIdsAndQuanties.forEach((productIdAndQuanty) => {
      if (
        normalizedProductsIdsAndQuanties.some(
          (pIdAndQ) => pIdAndQ.productId === productIdAndQuanty.productId,
        )
      ) {
        const index = normalizedProductsIdsAndQuanties.findIndex(function (
          normalizedPIdAndQ,
        ) {
          return normalizedPIdAndQ.productId === productIdAndQuanty.productId;
        });

        normalizedProductsIdsAndQuanties[index].quantity =
          normalizedProductsIdsAndQuanties[index].quantity +
          productIdAndQuanty.quantity;
      } else {
        normalizedProductsIdsAndQuanties.push(productIdAndQuanty);
      }
    });

    // TODO FALAR COM JOW
    // Checa se, depois de normalizado, o array tem algum Produto com Quantidade maior que cinco
    normalizedProductsIdsAndQuanties.forEach((pAndQ) => {
      if (pAndQ.quantity > 5) {
        throw new BadRequestException(
          `Cada Produto deve ter uma Quantidade máxima de cinco. Produto de ID "${pAndQ.productId}". Quantidade ${pAndQ.quantity}`,
        );
      }
    });

    return normalizedProductsIdsAndQuanties;
  }


  async getProducInStockAndAvailabilitytById(
    id: Types.ObjectId,
  ): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de produto "${id}" inválido`);
    }

    const found = await this.productsModel
      .findById(id)
      .select('stock available');

    if (!found) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }
    return found;
  }


  checkProductsStockAndAvailability(products: ProductFullOrder[]) {
    products.forEach((product) => {
      if (!product.product.available) {
        throw new BadRequestException(
          `Produto "${product.product.name}" indisponível`,
        );
      }
      if (product.product.stock < product.quantity) {
        throw new BadRequestException(
          `Sem estoque. Restam apenas "${product.product.stock}" unidades do produto "${product.product.name}" em estoque`,
        );
      }
    });
  }

}
