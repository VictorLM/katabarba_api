import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Shipment } from '../orders/models/shipment.type';
import { ShipmentSchema } from './models/shipment.schema';
import { CompaniesModule } from '../companies/companies.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports:[
    OrdersModule,
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
