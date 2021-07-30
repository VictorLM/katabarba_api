import { Injectable } from '@nestjs/common';
import * as MercadoPago from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { OrderDocument } from '../orders/models/order.schema';
import { CreatePreferencePayload, PreferenceItem } from 'mercadopago/models/preferences/create-payload.model';

@Injectable()
export class MercadoPagoService {
  constructor(private configService: ConfigService) {
    MercadoPago.configure({
      access_token: configService.get('MP_ACCESS_TOKEN'),
      sandbox: true, // TODO
    });
  }

  // TODO - ERROR HANDLING
  // TODO - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
  async createPreferenceWithOrderId(order: OrderDocument): Promise<{ mpPreferenceId: string }> {

    const items: PreferenceItem[] = [];

    order.productsAndQuantities.forEach(productAndQuantity => {

      items.push({
        id: String(productAndQuantity.product._id),
        title: productAndQuantity.product.name,
        description: productAndQuantity.product.description,
        picture_url: productAndQuantity.product.images[0],
        category_id: productAndQuantity.product.category,
        quantity: productAndQuantity.quantity,
        currency_id: "BRL",
        unit_price: productAndQuantity.product.price,
      });

    });

    const expireDate = this.getPreferenceExpireDate();

    // TODO - Se der problemas de rejeição das compras com cartão, add infos user no objeto payer
    const preference: CreatePreferencePayload = {
      items,
      external_reference: String(order._id),
      expires: true,
      expiration_date_to: expireDate,
      // notification_url: '', TODO - CONFIG NO PAINEL DO MP
      // payer: {
      //   phone: {},
      //   identification: {},
      //   address: {}
      // },
    };

    try {
      const response = await MercadoPago.preferences.create(preference);

      console.log(response.body);

      return { mpPreferenceId: response.body.id }; // Preference ID

    } catch(error) {
      console.log(error);
    }

  }

  // TODO - FALAR C/ JOW
  getPreferenceExpireDate(): string {
    // Data atual + uma semana
    const date = new Date();
    date.setDate(date.getDate() + 7);
    // FUSO BRAZIL - UTC-3
    const formatedDate = String(date.toISOString().replace('Z','-03:00'));
    return formatedDate;
  }

}
