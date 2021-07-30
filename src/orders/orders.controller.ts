import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { UserDocument } from '../users/models/user.schema';
import { CreateOrderDto } from './dtos/order.dto';
import { OrderDocument } from './models/order.schema';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('/')
  createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: UserDocument
  ): Promise<{ mpPreferenceId: string }> {
    return this.ordersService.createOrder(createOrderDto, user);
  }

}
