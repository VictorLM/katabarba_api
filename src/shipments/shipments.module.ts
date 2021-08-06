import { forwardRef, Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment, ShipmentSchema } from './models/shipment.schema';
import { CompaniesModule } from '../companies/companies.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { ErrorsModule } from '../errors/errors.module';

@Module({
  imports:[
    ErrorsModule,
    forwardRef(() => OrdersModule),
    ProductsModule,
    CompaniesModule,
    MongooseModule.forFeature([
      { name: Shipment.name, schema: ShipmentSchema },
    ]),
  ],
  providers: [ShipmentsService],
  controllers: [ShipmentsController],
  exports: [ShipmentsService]
})
export class ShipmentsModule {}
