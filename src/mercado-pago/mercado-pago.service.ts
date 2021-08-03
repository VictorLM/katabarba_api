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
import { get, findIndex } from 'lodash';
import { PaymentNotificationDTO } from '../payments/dtos/payment-notification.dto';
import { PaymentDTO } from '../payments/dtos/payment.dto';

@Injectable()
export class MercadoPagoService {
  constructor(private configService: ConfigService) {
    MercadoPago.configure({
      access_token: this.configService.get('MP_ACCESS_TOKEN'),
      sandbox: true, // TODO
    });
  }

  // TODO - WEBHOOKS URL PAINEL - TIPO PAGAMENTOS
  // TODO - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK - CRON
  async createPreferenceWithOrderId(
    order: OrderDocument,
    shipment: ShipmentDocument, // TO DELETE() IF ERROR
  ): Promise<{ mpPreferenceId: string }> {
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
        // TODO - LOG ERROR - EVENT
        console.log(response);
        await order.delete();
        await shipment.delete();
        throw new InternalServerErrorException(
          'Erro ao processar o pedido. Tente novamente mais tarde. Error: 1',
        );
      }

      return { mpPreferenceId };
    } catch (error) {
      console.error(error);
      // TODO - LOG ERROR - EVENT
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
      const paymentData = await MercadoPago.payment.get(Number(paymentNotificationDTO.data.id));

      if (paymentData.status !== 200) {
        throw new InternalServerErrorException();
      }

      const paymentDTO: PaymentDTO = {
        order: paymentData.body.external_reference,
        mpId: paymentData.body.id,
        status: paymentData.body.status,
        statusDetail: paymentData.body.status_detail,
        approvedAt: paymentData.body.date_approved,
        expiresIn: paymentData.body.date_of_expiration,
        moneyReleaseDate: paymentData.body.money_release_date,
        paymentTypeId: paymentData.body.payment_type_id,
        productsAmount: paymentData.body.transaction_amount,
        shippingAmount: paymentData.body.shipping_amount,
        mercadoPagoFee:
          paymentData.body.fee_details[
            findIndex(paymentData.body.fee_details, ['type', 'mercadopago_fee'])
          ].amount,
        currencyId: paymentData.body.currency_id,
      };

      // console.log(paymentDTO);

      return paymentDTO;

    } catch (error) {
      // TODO LOG - ESSE ERRO É IMPORTANTÍSSIMO TAMBÉM
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
