import { Body, Controller, Post } from '@nestjs/common';
import { PaymentNotificationDTO } from './dtos/payment-notification.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Para receber os POSTs do WebHook do Mercado Pago

  @Post('/notifications')
  handlePaymentNotificationWebHook(
    @Body() paymentNotificationDTO: PaymentNotificationDTO,
  ): Promise<void> {
    return this.paymentsService.handlePaymentNotificationWebHook(paymentNotificationDTO);
  }

}
