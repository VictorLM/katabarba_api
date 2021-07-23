import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompaniesService } from '../companies/companies.service';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { Shipment, ShipmentDocument } from './models/shipment.schema';
import axios from 'axios';
import { parse } from 'fast-xml-parser';
import { stringify } from 'query-string';
import { axiosConfig, CorreiosParams, correiosWebServiceUrl, ServiceCodes } from './templates/correios-params';
import { OrderDimensions } from '../products/models/product-dimensions.type';
import { ProductsService } from '../products/products.service';
import { ProductFullOrder } from '../products/dtos/product.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private shipmentsModel: Model<ShipmentDocument>,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
  ) {}

  async publicGetShipmentCosts( // TODO - Tratamento de erros
    publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO
  ): Promise<any> {
    const { deliveryZipCode, products } = publicGetShipmentCostsDTO;
    const originZipCode = await this.companiesService.getShiptCompanyZipCode();

    const productsAndQuantities = await this.productsService.getProductsAndQuantitiesById(products);
    // CHECAR DISPONIBILIDADE DOS PRODUTOS

    // Migrar estas funções para o OrdersService
    const orderDimensions = this.getOrderDimensions(productsAndQuantities);
    const orderWeight = this.getOrderWeight(productsAndQuantities);

    const params = new CorreiosParams(
      ServiceCodes.PAC, // TODO
      originZipCode,
      deliveryZipCode,
      orderDimensions,
      String(orderWeight),
    );

    try {
      const response = await axios.post(correiosWebServiceUrl, stringify(params), axiosConfig);

      console.log('STATUS CODE: ', response.status);
      const json = parse(response.data);
      console.log(json);
      return json;

    } catch (error) {
      console.error(error);
    }

  }

  getOrderDimensions(productsAndQuantities: ProductFullOrder[]): OrderDimensions {
    // Nesse caso, como é um produto apenas, estou apenas multiplicando a altura do pacote
    // Pois serão enviados empilhados um sobre o outro
    let height = 0;

    // GET HIGHER LENGHT AND WIDTH - TODO
    productsAndQuantities.forEach(product =>
      height = height + (product.quantity * product.product.dimensions.height),
    );

    const orderDimensions = new OrderDimensions(30, 20, height);
    return orderDimensions;
  }

  getOrderWeight(productsAndQuantities: ProductFullOrder[]): number {
    let orderWeight = 0;
    productsAndQuantities.forEach(product =>
      orderWeight = orderWeight + (product.quantity * product.product.weight),
    );
    return Math.round(orderWeight * 100) / 100;
  }

}
