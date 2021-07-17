import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../users/get-user.decorator';
import { UserDocument } from '../users/models/user.schema';
import { CreateOrderDto } from './dto/order.dto';
import { OrderDocument } from './models/order.schema';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard())
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('/')
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: UserDocument
  ): Promise<void> {
    return this.ordersService.createOrder(createOrderDto, user);
  }

}
