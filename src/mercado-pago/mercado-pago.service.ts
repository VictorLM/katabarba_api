import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as MercadoPago from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { OrderDocument } from '../orders/models/order.schema';
import {
  CreatePreferencePayload,
  PreferenceItem,
  PreferencePayer,
  PreferenceShipment,
} from 'mercadopago/models/preferences/create-payload.model';
import { ShipmentDocument } from '../shipments/models/shipment.schema';
import { get, findIndex, isArray } from 'lodash';
import { PaymentNotificationDTO } from '../payments/dtos/payment-notification.dto';
import { PaymentDTO } from '../payments/dtos/payment.dto';
import { Types } from 'mongoose';
import { ErrorsService } from '../errors/errors.service';

@Injectable()
export class MercadoPagoService {
  constructor(
    private configService: ConfigService,
    private errorsService: ErrorsService,
  ) {
    try {
      MercadoPago.configure({
        access_token: this.configService.get('MP_ACCESS_TOKEN'),
        sandbox: true, // TODO
      });

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'MercadoPagoService.constructor',
        error,
        null,
      );
      throw new InternalServerErrorException('Erro ao inicializar MercadoPagoService');
    }
  }

  // TODO - WEBHOOKS URL PAINEL MP - TIPO > PAGAMENTOS
  // TODO - SCHEDULE > IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
  async createPreferenceWithOrderId(
    order: OrderDocument,
    shipment: ShipmentDocument, // TO DELETE() IF ERROR
  ): Promise<string> {
    const items: PreferenceItem[] = [];

    order.productsAndQuantities.forEach((productAndQuantity) => {
      items.push({
        id: String(productAndQuantity.product._id),
        title: productAndQuantity.product.name,
        description: productAndQuantity.product.description,
        picture_url: productAndQuantity.product.images[0],
        category_id: productAndQuantity.product.category,
        quantity: productAndQuantity.quantity,
        currency_id: 'BRL',
        unit_price: productAndQuantity.product.price,
      });
    });

    const payer: PreferencePayer = {
      name: order.user.name,
      surname: order.user.surname,
      email: order.user.email,
      identification: {
        type: 'CPF',
        number: String(order.user.cpf),
      },
      address: {
        zip_code: shipment.deliveryAddress['zipCode'],
        street_name: shipment.deliveryAddress['street'],
        street_number: shipment.deliveryAddress['number'],
      },
    };

    const shipments: PreferenceShipment = {
      cost: shipment.cost,
      mode: 'not_specified',
    };

    const expirationDate = this.getPreferenceExpirationDate();

    const preference: CreatePreferencePayload = {
      items,
      payer,
      shipments,
      external_reference: String(order._id),
      statement_descriptor: 'KataBarba',
      expires: true,
      expiration_date_to: expirationDate,
      marketplace: this.configService.get('MARKETPLACE_NAME'),
    };

    try {
      const response = await MercadoPago.preferences.create(preference);
      console.log(response.body); // TODO - COMMENT
      const mpPreferenceId = get(response, 'body.id', '');

      if (!mpPreferenceId) {
        // Se a resposta vier sem o body.id, não será tratada - TODO
        console.log(response);
        await order.delete();
        await shipment.delete();
        throw new InternalServerErrorException(
          'Erro ao processar o pedido. Tente novamente mais tarde. Error: 1',
        );
      }

      return mpPreferenceId;

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'MercadoPagoService.createPreferenceWithOrderId',
        error,
        null,
      );
      await order.delete();
      await shipment.delete();

      throw new InternalServerErrorException(
        'Erro ao processar o pedido. Tente novamente mais tarde. Error: 2',
      );
    }
  }

  // TODO - FALAR C/ JOW
  getPreferenceExpirationDate(): string {
    // Data atual + uma semana
    const date = new Date();
    date.setDate(date.getDate() + 7);
    // FUSO BRAZIL - UTC-3
    const formatedDate = String(date.toISOString().replace('Z', '-03:00'));
    return formatedDate;
  }

  async getPaymentData(
    paymentNotificationDTO: PaymentNotificationDTO,
  ): Promise<PaymentDTO> {
    try {
      const paymentData = await MercadoPago.payment.get(
        Number(paymentNotificationDTO.data.id),
      );

      if (paymentData.status !== 200) {
        throw new InternalServerErrorException();
      }

      const paymentDTO: PaymentDTO = {
        order: Types.ObjectId(paymentData.body.external_reference),
        mpId: paymentData.body.id,
        status: paymentData.body.status,
        statusDetail: paymentData.body.status_detail,
        approvedAt: paymentData.body.date_approved,
        expiresIn: paymentData.body.date_of_expiration,
        moneyReleaseDate: paymentData.body.money_release_date,
        paymentTypeId: paymentData.body.payment_type_id,
        productsAmount: paymentData.body.transaction_amount,
        shippingAmount: paymentData.body.shipping_amount,
        currencyId: paymentData.body.currency_id,
        mercadoPagoFee:
          isArray(paymentData.body.fee_details) &&
          paymentData.body.fee_details.length > 0
            ? paymentData.body.fee_details[
                findIndex(paymentData.body.fee_details, [
                  'type',
                  'mercadopago_fee',
                ])
              ].amount
            : null,
      };

      return paymentDTO;

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'MercadoPagoService.getPaymentData',
        error,
        paymentNotificationDTO,
      );
      throw new InternalServerErrorException();
    }
  }
}
