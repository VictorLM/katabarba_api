import { Controller, Get, Param } from '@nestjs/common';
import { ProductDocument } from './models/product.schema';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('/')
  getAllProducts(): Promise<ProductDocument[]> {
    return this.productsService.getAllProducts();
  }

  @Get('/available')
  getInStockAndAvailableProducts(): Promise<ProductDocument[]> {
    return this.productsService.getInStockAndAvailableProducts();
  }

  @Get('/:id')
  getProductById(@Param('id') id: string): Promise<ProductDocument> {
    return this.productsService.getProductById(id);
  }

  @Get('/:id/stock-availability')
  getProducInStockAndAvailabilitytById(@Param('id') id: string): Promise<ProductDocument> {
    return this.productsService.getProducInStockAndAvailabilitytById(id);
  }

}
