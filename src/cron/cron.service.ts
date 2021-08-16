import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailsService } from '../emails/emails.service';
import { ErrorsService } from '../errors/errors.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(
    private emailService: EmailsService,
    private errorsService: ErrorsService,
    private usersService: UsersService,
    private productsService: ProductsService,
    private paymentsService: PaymentsService,
    private ordersService: OrdersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendNotCheckedErrorsEmail(): Promise<void> {
    const errors = await this.errorsService.getNotCheckedAppErrors();
    if(errors.length > 0) {
      try {
        const admins = await this.usersService.getAdminUsers();
        if(admins.length > 10) {
          throw new InternalServerErrorException(`Número de admins > 10. ${admins.length} adiministradores encontrados! Verificar`);
        } else if(admins.length < 1) {
          throw new InternalServerErrorException('Nenhum administrador encontrado para envio dos erros não tratados da aplicação');
        } else {
          console.log('Enviando erros não tratados por e-mail ao(s) administrador(es)');
          await this.emailService.sendErrorsEmail(errors, admins);
        }

      } catch (error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError(
          null,
          'CronService.sendNotCheckedErrorsEmail',
          error,
          null,
        );
      }
    }
  }

}
