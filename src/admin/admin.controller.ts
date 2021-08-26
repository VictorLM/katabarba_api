import { Controller, Get, UseGuards, Query, Post, Body, Param } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MongoIdDTO } from '../mongoId.dto';
import { OrderQueryDTO } from '../orders/dtos/order-query.dto';
import { UpdateShipedOrderDTO } from '../orders/dtos/update-shiped-order.dto';
import { OrderDocument } from '../orders/models/order.schema';
import { GetUser } from '../users/decorators/get-user.decorator';
import { UserDocument } from '../users/models/user.schema';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/orders')
  getOrders(
    @Query() orderQueryDTO: OrderQueryDTO,
  ): Promise<{
    page: number,
    limit: number,
    totalCount: number,
    orders: OrderDocument[],
   }> {
    return this.adminService.getOrders(orderQueryDTO);
  }

  @Get('/orders/:id')
  getOrder(@Param() mongoIdDTO: MongoIdDTO): Promise<OrderDocument> {
    return this.adminService.getOrder(mongoIdDTO);
  }

  @Post('/orders/:id/shiped-order')
  updateShipedOrder(
    @Param() mongoIdDTO: MongoIdDTO,
    @Body() updateShipedOrderDTO: UpdateShipedOrderDTO,
    @GetUser() user: UserDocument,
  ): Promise<void> {
    return this.adminService.updateShipedOrder(mongoIdDTO, updateShipedOrderDTO, user);
  }

}
