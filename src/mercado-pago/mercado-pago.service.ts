import { Injectable } from '@nestjs/common';
import * as MercadoPago from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { OrderDocument } from '../orders/models/order.schema';
import { CreatePreferencePayload, PreferenceItem, PreferencePayer, PreferenceShipment } from 'mercadopago/models/preferences/create-payload.model';

@Injectable()
export class MercadoPagoService {
  constructor(private configService: ConfigService) {
    MercadoPago.configure({
      access_token: this.configService.get('MP_ACCESS_TOKEN'),
      sandbox: true, // TODO
    });
  }

  // TODO - IPN URL https://www.mercadopago.com.br/developers/panel/notifications/ipn

  // TODO - ERROR HANDLING
  // TODO - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
  async createPreferenceWithOrderId(
    order: OrderDocument,
  ): Promise<{ mpPreferenceId: string }> {

    const items: PreferenceItem[] = [];

    order.productsAndQuantities.forEach(productAndQuantity => {

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
        zip_code: order.shippment.deliveryAddress['zipCode'],
        street_name: order.shippment.deliveryAddress['street'],
        street_number: order.shippment.deliveryAddress['number'],
      }
    };

    const shipments: PreferenceShipment = {
      cost: order.shippment.cost,
    };

    const expirationDate = this.getPreferenceExpirationDate();

    const preference: CreatePreferencePayload = {
      items,
      payer,
      shipments,
      external_reference: String(order._id),
      expires: true,
      expiration_date_to: expirationDate,
      marketplace: this.configService.get('MARKETPLACE_NAME'),
      notification_url: 'https://webhook.site/9be0df76-379d-4932-aec7-7cd00cbd2616?source_news=webhooks',
      // TODO - TEMP - CONFIG IPN EM PRODUÇÃO
    };

    try {
      const response = await MercadoPago.preferences.create(preference);

      //////// CHECK TOTAL PRICE ===

      console.log(response.body);

      return { mpPreferenceId: response.body.id }; // Preference ID

    } catch(error) {
      console.log(error);
    }

  }

  // TODO - FALAR C/ JOW
  getPreferenceExpirationDate(): string {
    // Data atual + uma semana
    const date = new Date();
    date.setDate(date.getDate() + 7);
    // FUSO BRAZIL - UTC-3
    const formatedDate = String(date.toISOString().replace('Z','-03:00'));
    return formatedDate;
  }

}
