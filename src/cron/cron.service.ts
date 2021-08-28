import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EmailsService } from '../emails/emails.service';
import { ErrorsService } from '../errors/errors.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentsService } from '../payments/payments.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderDocument } from '../orders/models/order.schema';
import { get } from 'lodash';
import { EmailTypes } from '../emails/enums/email-types.enum';
import { OrderStatuses } from '../orders/enums/order-statuses.enum';
import { EmailStatuses } from '../emails/enums/email-statuses.enum';

@Injectable()
export class CronService {
  constructor(
    private emailsService: EmailsService,
    private errorsService: ErrorsService,
    private usersService: UsersService,
    private productsService: ProductsService, // TODO
    private paymentsService: PaymentsService, // TODO
    private ordersService: OrdersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendNotCheckedErrorsEmail(): Promise<void> {
    console.log('CRON - ENVIANDO ERROS NÃO TRATADOS POR E-MAIL AOS ADMINS');
    const errors = await this.errorsService.getNotCheckedAppErrors();
    if(errors.length > 0) {
      try {
        const admins = await this.usersService.getAdminUsersAndThrowIfErrors();
        console.log('Enviando erros não tratados por e-mail ao(s) administrador(es)');
        await this.emailsService.sendEmail({
          document: errors,
          type: EmailTypes.NEW_ERRORS,
          recipients: admins,
          relatedTo: null,
        });

      } catch (error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError({
          action: 'CronService.sendNotCheckedErrorsEmail',
          error,
        });
      }
    } else {
      console.log('Nenhum erro não tratado foi encontrado');
    }
  }

  // TODO - THROW ERROR INSIDE FOREACH STOPS THE LOOP?
  @Cron(CronExpression.EVERY_6_HOURS)
  async sendProductAvailableNotificationEmail(): Promise<void> {
    console.log('CRON - ENVIANDO NOTIFICAÇÕES DE PRODUTOS QUE VOLTARAM AO ESTOQUE POR E-MAIL');
    const notSentProductAvailableNotifications = await this.emailsService.getNotSentProductAvailableNotifications();
    if(notSentProductAvailableNotifications.length > 0) {
      notSentProductAvailableNotifications.forEach(async (pAN) => {
        if(get(pAN, 'product.name', null)) {
          if(pAN.product.stock > 0) {
            console.log('Enviando notificação de produto que voltou ao estoque');
            pAN.email = await this.emailsService.sendEmail({
              document: pAN,
              type: EmailTypes.PRODUCT_AVAILABLE,
              recipients: pAN.recipient,
              relatedTo: pAN._id,
            });
            await pAN.save();
          } else {
            console.log(`Erro ao Enviar notificação de produto que voltou ao estoque. Produto sem estoque: ${pAN}`);
            // Log error into DB - not await
            this.errorsService.createAppError({
              action: 'CronService.sendProductAvailableNotificationEmail',
              error: { message: 'Erro ao Enviar notificação de produto que voltou ao estoque. Produto sem estoque' },
              model: pAN,
            });
          }
        } else {
          console.log(`Erro ao Enviar notificação de produto que voltou ao estoque. Produto inexistente: ${pAN}`);
          // Log error into DB - not await
          this.errorsService.createAppError({
            action: 'CronService.sendProductAvailableNotificationEmail',
            error: { error: 'Erro ao Enviar notificação de produto que voltou ao estoque. Produto inexistente' },
            model: pAN,
          });
        }
      });
    } else {
      console.log('Nenhuma notificação de produto que voltou ao estoque encontrada');
    }
  }

  @Cron(CronExpression.EVERY_HOUR) // TODO - VAI DAR TEMPO ANTES DO STATUS DA ORDEM SER ALTERADO?
  async sendOrderPaymentConflictEmail(): Promise<void> {
    console.log('CRON - ENVIANDO CONFLITOS DE VALORES PEDIDOS X PAGAMENTO POR E-MAIL AOS ADMINS');
    const payedOrders = await this.ordersService.getPayedOrdersAndPopulatePayments();

    if(payedOrders.length > 0) {
      const payedOrdersWithConflict: OrderDocument[] = [];

      payedOrders.forEach((payedOrder) => {
        if(payedOrder.totalPrice !== payedOrder.payment.productsAmount + payedOrder.payment.shippingAmount) {
          payedOrdersWithConflict.push(payedOrder);
        }
      });

      if(payedOrdersWithConflict.length > 0) {
        try {
          const admins = await this.usersService.getAdminUsersAndThrowIfErrors();
          console.log('Enviando conflitos de valores dos Pedidos x Pagamentos por e-mail ao(s) administrador(es)');
          await this.emailsService.sendEmail({
            document: payedOrdersWithConflict,
            type: EmailTypes.VALUE_CONFLICT,
            recipients: admins,
            relatedTo: null,
          });

        } catch (error) {
          console.log(error);
          // Log error into DB - not await
          this.errorsService.createAppError({
            action: 'CronService.sendOrderPaymentConflictEmail',
            error,
          });
        }
      } else {
        console.log('Nenhum conflito de valores dos Pedidos x Pagamentos encontrado');
      }
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async resendEmailsWithErrors(): Promise<void> {
    console.log('CRON - REENVIANDO E-MAILS COM ERROS');
    const emailsWithErrors = await this.emailsService.getEmailsWithErrors();

    if(emailsWithErrors.length > 0) {
      try {
        emailsWithErrors.forEach(async (emailWithError) => {
          if (
            emailWithError.type === EmailTypes.ORDER_CREATE ||
            emailWithError.type === EmailTypes.ORDER_PAYED ||
            emailWithError.type === EmailTypes.ORDER_SHIPPED ||
            emailWithError.type === EmailTypes.ORDER_PAYMENT_REMINDER
          ) {
            const order = await this.ordersService.getOrderByIdAndPopulate(emailWithError.relatedTo);

            if(order.status === OrderStatuses.CANCELED) {
              emailWithError.status = EmailStatuses.expired;
              emailWithError.resend = null;
              await emailWithError.save();
              return;
            }

            await this.emailsService.resendEmail({
              email: emailWithError,
              document: order,
            });

          } else if (emailWithError.type === EmailTypes.PRODUCT_AVAILABLE) {
            const notification = await this.emailsService.getNotSentProductAvailableNotificationById(emailWithError.relatedTo);

            await this.emailsService.resendEmail({
              email: emailWithError,
              document: notification,
            });

          } else if (emailWithError.type === EmailTypes.NEW_ERRORS) {
            // TODO - RIP
            console.log('Reenvio de e-mails com errors ainda não implementado');

          } else if (emailWithError.type === EmailTypes.VALUE_CONFLICT) {
            // TODO - RIP
            console.log('Reenvio de e-mails com conflitos de Pedidos x Pagamentos ainda não implementado');

          } else if (emailWithError.type === EmailTypes.USER_PASSWORD_RESET) {
            // TODO - RIP
            console.log('Reenvio de e-mails de redefinição de senha do usuário ainda não implementado');

          } else {
            throw new InternalServerErrorException('Tipo de e-mail inválido');
          }

        });

      } catch (error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError({
          action: 'CronService.resendEmailsWithErrors',
          error,
        });
      }
    } else {
      console.log('Nenhum e-mail com erro encontrado');
    }

  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async cancelExpiredOrdersAndUpdateStocks(): Promise<void> {
    console.log('CRON - CANCELANDO ORDERS EXPIRADAS E ATUALIZANDO STOCK DOS PRODUTOS DESTAS');
    const expiredOrders = await this.ordersService.getExpiredOrders();

    if(expiredOrders.length > 0) {

      expiredOrders.forEach(async (order) => {
        await this.productsService.updateProductsStockFromCanceledOrder(order.productsAndQuantities);
        order.status = OrderStatuses.CANCELED;
        await order.save();
      });

    } else {
      console.log('Nenhuma order expirada encontrada');
    }
  }

}
