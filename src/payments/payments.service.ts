import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MercadoPagoService } from '../mercado-pago/mercado-pago.service';
import { PaymentDTO } from './dtos/payment.dto';
import { PaymentNotificationDTO } from './dtos/payment-notification.dto';
import { Payment, PaymentDocument } from './models/payment.schema';
import { OrdersService } from '../orders/orders.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentCreatedEvent } from './events/payment.events';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentsModel: Model<PaymentDocument>,
    private mercadoPagoService: MercadoPagoService,
    private ordersService: OrdersService,
    private eventEmitter: EventEmitter2,
  ) {}

  async handlePaymentNotificationWebHook(
    paymentNotificationDTO: PaymentNotificationDTO,
  ): Promise<void> {
    const paymentDTO = await this.mercadoPagoService.getPaymentData(paymentNotificationDTO);

    const foundPayment = await this.paymentsModel.findOne({ mpId: paymentDTO.mpId });

    // Fazendo dessa forma porque o upsert não deu certo
    if(foundPayment) {
      await this.updatePayment(foundPayment, paymentDTO);
    } else {
      await this.createPayment(paymentDTO);
    }

  }

  async createPayment(paymentDTO: PaymentDTO): Promise<void> {
    const newPayment = new this.paymentsModel(paymentDTO);

    try {
      await newPayment.save();
      await this.ordersService.updateOrderWithPaymentData(newPayment);
      // Event
      this.eventEmitter.emit(
        'payment.created',
        new PaymentCreatedEvent(newPayment),
      );

    } catch (error) {
      // TODO LOG
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async updatePayment(
    foundPayment: PaymentDocument,
    paymentDTO: PaymentDTO,
  ): Promise<void> {

    foundPayment.status = paymentDTO.status;
    foundPayment.statusDetail = paymentDTO.statusDetail;
    foundPayment.approvedAt = paymentDTO.approvedAt;
    foundPayment.expiresIn = paymentDTO.expiresIn;
    foundPayment.moneyReleaseDate = paymentDTO.moneyReleaseDate;
    foundPayment.mercadoPagoFee = paymentDTO.mercadoPagoFee;

    try {
      await foundPayment.save();
      await this.ordersService.updateOrderWithPaymentData(foundPayment);

    } catch (error) {
      // TODO LOG
      console.log(error);
      throw new InternalServerErrorException();
    }

  }

}
