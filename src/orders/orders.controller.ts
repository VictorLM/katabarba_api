import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { UserDocument } from '../users/models/user.schema';
import { CreateOrderDto } from './dtos/order.dto';
import { OrderDocument } from './models/order.schema';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
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
