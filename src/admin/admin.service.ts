import { Injectable } from '@nestjs/common';
import { EmailsService } from '../emails/emails.service';
import { ErrorsService } from '../errors/errors.service';
import { OrderQueryDTO } from '../orders/dtos/order-query.dto';
import { OrderDocument } from '../orders/models/order.schema';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { ProductsService } from '../products/products.service';
import { UserDocument } from '../users/models/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private emailsService: EmailsService,
    private errorsService: ErrorsService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private paymentsService: PaymentsService, // TODO - BUSCAR ORDER PAYMENT
    private ordersService: OrdersService,
  ) {}

  // test(user: UserDocument): string {
  //   return 'test';
  // }

  // ORDERS

  async getOrders(
    orderQueryDTO: OrderQueryDTO,
  ): Promise<{
    orders: OrderDocument[],
    page: number,
    count: number,
   }> {
    // pagination
    // order by
    // where !payed, canceled, etc


    const orders = await this.ordersService.getOrders(orderQueryDTO);

    return orders;
  }

}
