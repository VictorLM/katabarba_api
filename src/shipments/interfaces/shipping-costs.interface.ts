import { ShippingCompanies } from "../enums/shipping-companies.enum";
import { ShippingTypes } from "../enums/shipping-types.enum";

export interface ShipmentCostAndDeadline {
  type: ShippingTypes;
  cost: number;
  deadline: number; // days
};

export interface ShipmentsCostAndDeadlinePerCompany {
  company: ShippingCompanies;
  shipmentCostsAndDeadlines: ShipmentCostAndDeadline[];
};

export interface ShipmentsCostsAndDeadlines {
  deliveryZipCode: string; // TODO - VALIDAR CEP
  shipmentCostAndDeadlinePerCompany: ShipmentsCostAndDeadlinePerCompany[];
};
