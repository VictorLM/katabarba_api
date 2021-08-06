import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorsService } from '../errors/errors.service';
import { ProductFullOrder, ProductOrder } from './dtos/product.dto';
import { Product, ProductDocument } from './models/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productsModel: Model<ProductDocument>,
    private errorsService: ErrorsService,
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
    try {
      const productsAndQuanties: ProductFullOrder[] = await Promise.all(
        productsIdsAndQuanties.map(async (product) => ({
          product: await this.getProductById(product.productId),
          quantity: product.quantity,
        })),
      );

      return productsAndQuanties;

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'ProductsService.getProductsAndQuantitiesById',
        error,
        productsIdsAndQuanties,
      );

      throw new InternalServerErrorException('Erro ao processar novo pedido. Por favor, tente novamente mais tarde');
    }
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

  async updateProductsStockByOrderProductsAndQuantities(
    orderProductsAndQuantities: ProductFullOrder[],
  ): Promise<void> {
    try {
      orderProductsAndQuantities.forEach(async (product) => {
        product.product.stock = product.product.stock - product.quantity;
        await product.product.save();
      });

    } catch (error) {
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'ProductsService.updateProductsStockByOrderProductsAndQuantities',
        error,
        orderProductsAndQuantities,
      );
    }
  }

  // Resolvido com @ArrayUnique((product) => product.productId) do Class Validator
  // normalizeProductsIdsAndQuantiesArray(
  //   productsIdsAndQuanties: ProductOrder[],
  // ): ProductOrder[] {
  //   const normalizedProductsIdsAndQuanties: ProductOrder[] = [];

  //   productsIdsAndQuanties.forEach((productIdAndQuanty) => {
  //     if (
  //       normalizedProductsIdsAndQuanties.some(
  //         (pIdAndQ) => pIdAndQ.productId === productIdAndQuanty.productId,
  //       )
  //     ) {
  //       const index = normalizedProductsIdsAndQuanties.findIndex(function (
  //         normalizedPIdAndQ,
  //       ) {
  //         return normalizedPIdAndQ.productId === productIdAndQuanty.productId;
  //       });

  //       normalizedProductsIdsAndQuanties[index].quantity =
  //         normalizedProductsIdsAndQuanties[index].quantity +
  //         productIdAndQuanty.quantity;
  //     } else {
  //       normalizedProductsIdsAndQuanties.push(productIdAndQuanty);
  //     }
  //   });

  //   // TODO FALAR COM JOW
  //   // Checa se, depois de normalizado, o array tem algum Produto com Quantidade maior que cinco
  //   normalizedProductsIdsAndQuanties.forEach((pAndQ) => {
  //     if (pAndQ.quantity > 5) {
  //       throw new BadRequestException(
  //         `Cada Produto deve ter uma Quantidade máxima de cinco. Produto de ID "${pAndQ.productId}". Quantidade ${pAndQ.quantity}`,
  //       );
  //     }
  //   });

  //   return normalizedProductsIdsAndQuanties;
  // }

}
