import { Injectable } from '@nestjs/common';
import * as MercadoPago from 'mercadopago';
import { ConfigService } from '@nestjs/config';
import { OrderDocument } from '../orders/models/order.schema';

@Injectable()
export class MercadoPagoService {
  constructor(private configService: ConfigService) {
    MercadoPago.configure({
      access_token: configService.get('MP_ACCESS_TOKEN'),
      sandbox: true, // TODO
    });
  }

  // TODO - IF !PAYMENT CANCEL ORDER AND UPDATE PRODUCTS STOCK
  async createMercadoPagoPreference(order: OrderDocument ): Promise<string> {
    return 'testeDeId123';
    // const items: PreferenceItem[] =
    //   [
    //     {
    //       id: 'idddd', // todo
    //       title: "Dummy Item",
    //       description: "Dummy description",
    //       picture_url: "http://www.myapp.com/myimage.jpg",
    //       category_id: "cat123",
    //       quantity: 1,
    //       currency_id: "BRL",
    //       unit_price: 100,
    //     },
    //   ];

    // const preference: CreatePreferencePayload = {
    //   external_reference: 'test123', // ORDER ID?
    //   // expires: true,
    //   // expiration_date_to: 1 mes futuro
    //   // notification_url: '', meter ID + URL?
    //   items,
    //   // payer: {
    //   //   phone: {},
    //   //   identification: {},
    //   //   address: {}
    //   // },
    //   // payment_methods: {
    //   //   default_payment_method_id: '',
    //   //   excluded_payment_methods: [
    //   //     { id: 'account_money'}
    //   //   ],
    //   // },
    // };

    // //return mpPreferenceId;

    // try {
    //   const response = await MercadoPago.preferences.create(preference);
    //   console.log(response.body);
    //   // preference_id = response.body.id;
    //   return response.body;

    // } catch(error) {
    //   console.log(error);
    // }
  }

}
