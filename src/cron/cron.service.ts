import { Injectable } from '@nestjs/common';
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
import { Types } from 'mongoose';
import { OrderStatuses } from '../orders/enums/order-statuses.enum';
import { EmailStatuses } from '../emails/enums/email-statuses.enum';

@Injectable()
export class CronService {
  constructor(
    private emailService: EmailsService,
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
        await this.emailService.sendErrorsEmail(errors, admins);

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

  // TODO - THROW ERROR INSIDE FOREACH STOPS THE LOOP?
  @Cron(CronExpression.EVERY_6_HOURS)
  async sendProductAvailableNotificationEmail(): Promise<void> {
    console.log('CRON - ENVIANDO NOTIFICAÇÕES DE PRODUTOS QUE VOLTARAM AO ESTOQUE POR E-MAIL');
    const notSentProductAvailableNotifications = await this.emailService.getNotSentProductAvailableNotifications();
    if(notSentProductAvailableNotifications.length > 0) {
      notSentProductAvailableNotifications.forEach(async (pAN) => {
        if(get(pAN, 'product.name', null)) {
          if(pAN.product.stock > 0) {
            console.log('Enviando notificação de produto que voltou ao estoque');
            pAN.email = await this.emailService.sendProductAvailableNotificationsEmail(pAN);
            await pAN.save();
          } else {
            console.log(`Erro ao Enviar notificação de produto que voltou ao estoque. Produto sem estoque: ${pAN}`);
            // Log error into DB - not await
            this.errorsService.createAppError(
              null,
              'CronService.sendProductAvailableNotificationEmail',
              { error: 'Erro ao Enviar notificação de produto que voltou ao estoque. Produto sem estoque' },
              pAN,
            );
          }
        } else {
          console.log(`Erro ao Enviar notificação de produto que voltou ao estoque. Produto inexistente: ${pAN}`);
          // Log error into DB - not await
          this.errorsService.createAppError(
            null,
            'CronService.sendProductAvailableNotificationEmail',
            { error: 'Erro ao Enviar notificação de produto que voltou ao estoque. Produto inexistente' },
            pAN,
          );
        }
      });
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
          await this.emailService.sendOrderPaymentConflictsEmail(payedOrdersWithConflict, admins);

        } catch (error) {
          console.log(error);
          // Log error into DB - not await
          this.errorsService.createAppError(
            null,
            'CronService.sendOrderPaymentConflictEmail',
            error,
            null,
          );
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async resendEmailsWithErrors(): Promise<void> {
    console.log('CRON - REENVIANDO E-MAILS COM ERROS');
    const emailsWithErrors = await this.emailService.getEmailsWithErrors();

    if(emailsWithErrors.length > 0) {
      try {
        emailsWithErrors.forEach(async (emailWithError) => {
          if (
            emailWithError.type === EmailTypes.ORDER_CREATE ||
            emailWithError.type === EmailTypes.ORDER_PAYED ||
            emailWithError.type === EmailTypes.ORDER_SHIPPED ||
            emailWithError.type === EmailTypes.ORDER_PAYMENT_REMINDER
          ) {
            const order = await this.ordersService.getOrderById(emailWithError.relatedTo);
            if(order.status !== OrderStatuses.CANCELED) {
              await this.emailService.resendFailedOrderEmail(emailWithError, order);
            } else {
              emailWithError.resend = null;
              emailWithError.status = EmailStatuses.expired;
              await emailWithError.save();
            }
          } else if (emailWithError.type === EmailTypes.PRODUCT_AVAILABLE) {
            // TODO
          } else if (emailWithError.type === EmailTypes.NEW_ERRORS) {
            // TODO
          } else if (emailWithError.type === EmailTypes.ORDER_PAYMENT_VALUE_CONFLICT) {
            // TODO
          } else if (emailWithError.type === EmailTypes.USER_PASSWORD_RESET) {
            // TODO
          } else {
            // TODO
          }
        });

      } catch (error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError(
          null,
          'CronService.resendEmailsWithErrors',
          error,
          null,
        );
      }
    }

  }

}
