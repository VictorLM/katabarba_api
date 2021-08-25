import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderQueryDTO } from '../orders/dtos/order-query.dto';
import { OrderDocument } from '../orders/models/order.schema';
// import { GetUser } from '../users/decorators/get-user.decorator';
// import { UserDocument } from '../users/models/user.schema';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('/orders')
  getOrders(
    @Body() orderQueryDTO: OrderQueryDTO
  ): Promise<{
    orders: OrderDocument[],
    page: number,
    count: number,
   }> {
    return this.adminService.getOrders(orderQueryDTO);
  }

}
