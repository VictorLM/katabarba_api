import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './models/order.schema';
import { UsersModule } from '../users/users.module';
import { Product, ProductSchema } from '../products/models/product.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController]
})
export class OrdersModule {}
