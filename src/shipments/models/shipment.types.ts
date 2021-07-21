export enum ShippingCompanies { // Por enquanto só Correios
  CORREIOS = 'CORREIOS',
}

export enum ShippingTypes {
  // CORREIOS
  CORREIOS_CARTA_REGISTRADA = 'CARTA_REGISTRADA',
  CORREIOS_PAC = 'PAC',
  CORREIOS_SEDEX = 'SEDEX',
  CORREIOS_SEDEX_10 = 'SEDEX_10',
  CORREIOS_SEDEX_HOJE = 'SEDEX_HOJE',
}

export type ShipmentStatus = {
  status: string,
  date: Date
};
