import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './models/order.schema';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { AddressesModule } from '../addresses/addresses.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { MercadoPagoModule } from '../mercado-pago/mercado-pago.module';
import { ErrorsModule } from '../errors/errors.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [
    EmailsModule,
    ErrorsModule,
    MercadoPagoModule,
    forwardRef(() => ShipmentsModule),
    AuthModule,
    AddressesModule,
    ProductsModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
