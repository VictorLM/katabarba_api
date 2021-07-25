import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompaniesService } from '../companies/companies.service';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { Shipment, ShipmentDocument } from './models/shipment.schema';
import axios from 'axios';
import { get } from 'lodash';
import { parse } from 'fast-xml-parser';
import { stringify } from 'query-string';
import {
  axiosCorreiosConfig,
  CorreiosParams,
  correiosWebServiceUrl,
  CorreiosServiceCodes
} from './templates/correios-params';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { ShipmentCostAndDeadline, ShipmentsCostsAndDeadlines } from './interfaces/shipping-costs.interface';
import { ShippingTypesCorreios } from './enums/shipping-types.enum';
import { OrderBoxDimensions } from '../orders/interfaces/order-dimensions.interface';
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
  // TODO - IF PRODUCT FREE SHIPMENT
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
    orderDimensions: OrderBoxDimensions,
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


  // TODO - DEPLOY SERVICE PARA REPORTAR A CADA ERRO LANÇADO
  async getShipmentCostsAndDeadlinesFromCorreios(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderBoxDimensions,
    orderWeight: number,
  ): Promise<ShipmentCostAndDeadline[]> {
    const shipmentCostsAndDeadlinesFromCorreios: ShipmentCostAndDeadline[] = [];

    for (const code in CorreiosServiceCodes) {
      const tempShipmentCostAndDeadline = await this.getShipmentCostAndDeadlineFromCorreiosByType(
        originZipCode, deliveryZipCode, orderDimensions, orderWeight, ShippingTypesCorreios[code]
      );
      shipmentCostsAndDeadlinesFromCorreios.push(tempShipmentCostAndDeadline);
    }

    return shipmentCostsAndDeadlinesFromCorreios;
  }


  // TODO - DEPLOY SERVICE PARA REPORTAR A CADA ERRO LANÇADO
  async getShipmentCostAndDeadlineFromCorreiosByType(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderBoxDimensions,
    orderWeight: number,
    ShippingTypeCorreios: ShippingTypesCorreios,
  ): Promise<ShipmentCostAndDeadline> {

    const error = {
      code: 0,
      message: '',
    };

    const params = new CorreiosParams(
      CorreiosServiceCodes[ShippingTypeCorreios],
      originZipCode,
      deliveryZipCode,
      orderDimensions,
      String(orderWeight),
    );

    try {
      const response = await axios.post(correiosWebServiceUrl, stringify(params), axiosCorreiosConfig);
      const parsedResponseData = parse(response.data);

      error.code = Number(get(parsedResponseData, 'cResultado.Servicos.cServico.Erro', 0));
      error.message = get(parsedResponseData, 'cResultado.Servicos.cServico.MsgErro', '');

      const shipmentCostAndDeadlineFromCorreiosByType: ShipmentCostAndDeadline = {
        type: ShippingTypesCorreios[ShippingTypeCorreios],
        cost: parseFloat(get(parsedResponseData, 'cResultado.Servicos.cServico.Valor', 0).replace(/,/g, '.')),
        deadline: Number(get(parsedResponseData, 'cResultado.Servicos.cServico.PrazoEntrega', 0)),
      };

      // 0 = no errors
      if(error.code !== 0){
        throw new InternalServerErrorException(`Erro ao calcular o frete. ${error.message}`);
      }

      return shipmentCostAndDeadlineFromCorreiosByType;

    } catch (error) {

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.message);
        console.log('Error code: ', error.response.status);
        console.log(error.response);
        throw new InternalServerErrorException(`${get(error, 'response.message', 'Erro ao calcular o frete. Por favor, tente novamente mais tarde.')}`);

      } else if (error.request) {
        // No response
        console.log('WebService dos Correios não está respondendo');
        throw new ServiceUnavailableException('Erro ao calcular o frete. Serviço indisponível. Por favor, tente novamente mais tarde');

      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Erro ao calcular frete Correios: ', get(error, 'message', 'Erro interno'));
        throw new InternalServerErrorException(`Erro ao calcular o frete. Por favor, tente novamente mais tarde.`);
      }

    }

  }


}
