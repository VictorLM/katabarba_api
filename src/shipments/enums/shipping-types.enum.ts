export enum ShippingTypesCorreios {
  // CORREIOS
  CARTA_REGISTRADA = 'CARTA_REGISTRADA',
  PAC = 'PAC',
  SEDEX = 'SEDEX',
}

// type ShippingTypes = ShippingTypesCorreios | otherCompanyShippingType;
export type ShippingTypes = ShippingTypesCorreios;
