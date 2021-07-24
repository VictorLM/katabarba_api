import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompaniesService } from '../companies/companies.service';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { Shipment, ShipmentDocument } from './models/shipment.schema';
import axios from 'axios';
import { get } from 'lodash';
import { parse } from 'fast-xml-parser';
import { stringify } from 'query-string';
import { axiosCorreiosConfig, CorreiosParams, correiosWebServiceUrl, CorreiosServiceCodes } from './templates/correios-params';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { ShipmentCostAndDeadline, ShipmentsCostsAndDeadlines } from './interfaces/shipping-costs.interface';
import { ShippingTypes } from './enums/shipping-types.enum';
import { OrderDimensions } from '../orders/interfaces/order-dimensions.interface';
import { ShippingCompanies } from './enums/shipping-companies.enum';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private shipmentsModel: Model<ShipmentDocument>,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    private ordersService: OrdersService,
  ) {}

  // TODO - DEFINIR FRETE MÍNIMO
  async publicGetShipmentsCosts(
    publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO
  ): Promise<ShipmentsCostsAndDeadlines> {
    const { deliveryZipCode, productsIdsAndQuanties } = publicGetShipmentCostsDTO;
    const originZipCode = await this.companiesService.getShiptCompanyZipCode();

    const productsAndQuantities = await this.productsService.getProductsAndQuantitiesById(productsIdsAndQuanties);

    this.productsService.checkProductsStockAndAvailability(productsAndQuantities);

    const orderDimensions = this.ordersService.getOrderDimensions(productsAndQuantities);
    const orderWeight = this.ordersService.getOrderWeight(productsAndQuantities);

    const shipmentCostsAndDeadlines = await this.getShipmentCostsAndDeadlines(
      originZipCode, deliveryZipCode, orderDimensions, orderWeight
    );

    return shipmentCostsAndDeadlines;
  }

  async getShipmentCostsAndDeadlines(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderDimensions,
    orderWeight: number,
  ): Promise<ShipmentsCostsAndDeadlines> {

    const shipmentCostsAndDeadlinesFromCorreios = await this.getShipmentCostsAndDeadlinesFromCorreios(
      originZipCode, deliveryZipCode, orderDimensions, orderWeight
    );

    const shipmentCostsAndDeadlines: ShipmentsCostsAndDeadlines = {
      deliveryZipCode,
      shipmentCostAndDeadlinePerCompany: [{
        company: ShippingCompanies.CORREIOS,
        shipmentCostsAndDeadlines: shipmentCostsAndDeadlinesFromCorreios,
      }],
    };

    return shipmentCostsAndDeadlines;
  }

  // TODO - Tratamento de erros ///////////////////////////
  async getShipmentCostsAndDeadlinesFromCorreios(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderDimensions,
    orderWeight: number,
  ): Promise<ShipmentCostAndDeadline[]> {

    const shipmentCostsAndDeadlinesFromCorreios: ShipmentCostAndDeadline[] = [];

    for (const code in CorreiosServiceCodes) {

      const params = new CorreiosParams(
        CorreiosServiceCodes[code],
        originZipCode,
        deliveryZipCode,
        orderDimensions,
        String(orderWeight),
      );

      try {
        const response = await axios.post(correiosWebServiceUrl, stringify(params), axiosCorreiosConfig);
        // console.log('STATUS CODE: ', response.status);
        const parsedResponseData = parse(response.data);

        shipmentCostsAndDeadlinesFromCorreios.push({
          type: ShippingTypes['CORREIOS_' + code],
          cost: parseFloat(get(parsedResponseData, 'cResultado.Servicos.cServico.Valor', 0).replace(/,/g, '.')),
          deadline: Number(get(parsedResponseData, 'cResultado.Servicos.cServico.PrazoEntrega', 0)),
        });

      } catch (error) {

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          // console.log(error.request);
          console.log('WS Correios não responde');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }

      }

    }

    console.log(shipmentCostsAndDeadlinesFromCorreios);
    return shipmentCostsAndDeadlinesFromCorreios;
  }

}
