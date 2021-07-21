import { Types } from 'mongoose';
import { AddressDocument } from '../../addresses/models/address.schema';

export enum ShippingCompanies { // Por enquanto só Correios
  CORREIOS = 'CORREIOS',
}

export enum ShippingTypes {
  // CORREIOS
  CARTA_REGISTRADA = 'CARTA_REGISTRADA',
  PAC = 'PAC',
  SEDEX = 'SEDEX',
  SEDEX_10 = 'SEDEX_10',
  SEDEX_HOJE = 'SEDEX_HOJE',
}

export class Shipment {
  shiptAddress: Types.ObjectId;
  deliveryAddress: AddressDocument;
  cost: number;
  company: ShippingCompanies;
  type: string;
  shipped: Date | null;
  trackingCode: string | null;
  statuses: [{
    status: string,
    date: Date
  }] | null;
}
