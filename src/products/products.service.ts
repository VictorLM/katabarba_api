import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductFullOrder, ProductOrder } from './dtos/product.dto';
import { Product, ProductDocument } from './models/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productsModel: Model<ProductDocument>) {}

  async getAllProducts(): Promise<ProductDocument[]> {
    return this.productsModel.find().exec();
    // TODO - ORDER BY AVAILIBLE TRUE AND STOCK > 0
  }

  async getInStockAndAvailableProducts(): Promise<ProductDocument[]> {
    return this.productsModel.find({
      available: true,
      stock: { $gt: 0 },
    }).exec();
  }

  async getProductById(id: string): Promise<ProductDocument> {
    const found = await this.productsModel.findById(id);
    if (!found) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getProductsAndQuantitiesById(
    productsIds: ProductOrder[],
  ): Promise<ProductFullOrder[]> {
    const products: ProductFullOrder[] = await Promise.all(
      productsIds.map(async (product) => ({
        product: await this.getProductById(product.productId),
        quantity: product.quantity,
      })),
    );

    return products;
  }

  async getProducInStockAndAvailabilitytById(id: string): Promise<ProductDocument> {
    const found = await this.productsModel.findById(id).select('stock available');
    if (!found) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado`);
    }
    return found;
  }

  checkProductsStockAndAvailability(products: ProductFullOrder[]) {
    products.forEach(product => {
      if(!product.product.available){
        throw new BadRequestException(`Produto "${product.product.name}" indisponível`);
      }
      if(product.product.stock < product.quantity){
        throw new BadRequestException(
          `Sem estoque. Restam apenas "${product.product.stock}" unidades do produto "${product.product.name}" em estoque`
        );
      }
    });
  }

}
