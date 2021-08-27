import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompaniesService } from '../companies/companies.service';
import { CreateShipmentDTO, PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { Shipment, ShipmentDocument } from './models/shipment.schema';
import axios from 'axios';
import { get } from 'lodash';
import { parse } from 'fast-xml-parser';
import { stringify } from 'query-string';
import {
  axiosCorreiosConfig,
  CorreiosParams,
  correiosWebServiceUrl,
  CorreiosServiceCodes,
} from './templates/correios-params';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import {
  ShipmentCostAndDeadline,
  ShipmentsCostsAndDeadlines,
} from './interfaces/shipping-costs.interface';
import { ShippingTypes } from './enums/shipping-types.enum';
import { OrderBoxDimensions } from '../orders/interfaces/order-dimensions.interface';
import { ShippingCompanies } from './enums/shipping-companies.enum';
import { ErrorsService } from '../errors/errors.service';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private shipmentsModel: Model<ShipmentDocument>,
    private companiesService: CompaniesService,
    private productsService: ProductsService,
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private errorsService: ErrorsService,
  ) {}

  async getShipmentById(id: Types.ObjectId): Promise<ShipmentDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de Remessa "${id}" inválido`);
    }
    const foundShipment = await this.shipmentsModel.findById(id);
    if (!foundShipment) {
      throw new NotFoundException(`Remessa com ID "${id}" não encontrado`);
    }
    return foundShipment;
  }

  async updateShipedShipmentById(id: Types.ObjectId, trackingCode: string): Promise<void> {
    const foundShipment = await this.getShipmentById(id);
    foundShipment.shipped = new Date();
    foundShipment.trackingCode = trackingCode;

    try {
      await foundShipment.save();

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError({
        action: 'ShipmentsService.updateShipedShipmentById',
        error,
        model: foundShipment,
      });
      throw new InternalServerErrorException('Erro ao atualizar Remessa. Por favor, tente novamente mais tarde');
    }
  }

  async createShipment(createShipmentDTO: CreateShipmentDTO): Promise<ShipmentDocument> {
    const { deliveryAddress, shippingCompany, shippingType, productsAndQuantities } = createShipmentDTO;
    const shiptCompanyAddress = await this.companiesService.getShiptCompanyAddress();
    // return shiptCompanyAddress;
    const orderDimensions = this.ordersService.getOrderDimensions(
      productsAndQuantities,
    );
    const orderWeight = this.ordersService.getOrderWeight(
      productsAndQuantities,
    );
    // if(shippingCompany === ShippingCompanies.CORREIOS) {
    //} else if(shippingCompany === ShippingCompanies.OTHERCOMPANY) {}
    // Sem else porque o order-dto já retorna erro senão enum
    const shipmentCostAndDeadline = await this.getShipmentCostAndDeadlineFromCorreiosByType(
      shiptCompanyAddress.zipCode,
      deliveryAddress.zipCode,
      orderDimensions,
      orderWeight,
      shippingType,
    );

    const newShipment = new this.shipmentsModel({
      shiptAddress: shiptCompanyAddress,
      deliveryAddress,
      company: shippingCompany,
      type: shipmentCostAndDeadline.type,
      cost: shipmentCostAndDeadline.cost,
      deadline: shipmentCostAndDeadline.deadline,
    });

    try {
      return await newShipment.save();

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError({
        action: 'ShipmentsService.createShipment',
        error,
        model: newShipment,
      });
      throw new InternalServerErrorException('Erro ao criar Remessa. Por favor, tente novamente mais tarde');
    }

  }

  // TODO - DEFINIR FRETE MÍNIMO
  // TODO - IF VALUE || DEADLINE = 0
  // TODO - IF PRODUCT FREE SHIPMENT
  async publicGetShipmentsCosts(
    publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO,
  ): Promise<ShipmentsCostsAndDeadlines> {
    const { deliveryZipCode, productsIdsAndQuanties } =
      publicGetShipmentCostsDTO;
    const originZipCode = await this.companiesService.getShiptCompanyZipCode();

    const productsAndQuantities =
      await this.productsService.getProductsAndQuantitiesById(
        productsIdsAndQuanties,
      );

    this.productsService.checkProductsStockAndAvailability(
      productsAndQuantities,
    );

    const orderDimensions = this.ordersService.getOrderDimensions(
      productsAndQuantities,
    );
    const orderWeight = this.ordersService.getOrderWeight(
      productsAndQuantities,
    );

    const shipmentCostsAndDeadlines = await this.getShipmentCostsAndDeadlines(
      originZipCode,
      deliveryZipCode,
      orderDimensions,
      orderWeight,
    );

    return shipmentCostsAndDeadlines;
  }

  async getShipmentCostsAndDeadlines(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderBoxDimensions,
    orderWeight: number,
  ): Promise<ShipmentsCostsAndDeadlines> {
    const shipmentCostsAndDeadlinesFromCorreios =
      await this.getShipmentCostsAndDeadlinesFromCorreios(
        originZipCode,
        deliveryZipCode,
        orderDimensions,
        orderWeight,
      );

    const shipmentCostsAndDeadlines: ShipmentsCostsAndDeadlines = {
      deliveryZipCode,
      shipmentCostAndDeadlinePerCompany: [
        {
          company: ShippingCompanies.CORREIOS,
          shipmentCostsAndDeadlines: shipmentCostsAndDeadlinesFromCorreios,
        },
      ],
    };

    return shipmentCostsAndDeadlines;
  }

  async getShipmentCostsAndDeadlinesFromCorreios(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderBoxDimensions,
    orderWeight: number,
  ): Promise<ShipmentCostAndDeadline[]> {
    const shipmentCostsAndDeadlinesFromCorreios: ShipmentCostAndDeadline[] = [];

    for (const code in CorreiosServiceCodes) {
      const tempShipmentCostAndDeadline =
        await this.getShipmentCostAndDeadlineFromCorreiosByType(
          originZipCode,
          deliveryZipCode,
          orderDimensions,
          orderWeight,
          ShippingTypes[code],
        );
      shipmentCostsAndDeadlinesFromCorreios.push(tempShipmentCostAndDeadline);
    }

    return shipmentCostsAndDeadlinesFromCorreios;
  }

  async getShipmentCostAndDeadlineFromCorreiosByType(
    originZipCode: string,
    deliveryZipCode: string,
    orderDimensions: OrderBoxDimensions,
    orderWeight: number,
    shippingType: ShippingTypes,
  ): Promise<ShipmentCostAndDeadline> {
    const error = {
      code: 0,
      message: '',
    };

    const params = new CorreiosParams(
      CorreiosServiceCodes[shippingType],
      originZipCode,
      deliveryZipCode,
      orderDimensions,
      String(orderWeight),
    );

    try {
      const response = await axios.post(
        correiosWebServiceUrl,
        stringify(params),
        axiosCorreiosConfig,
      );
      const parsedResponseData = parse(response.data);

      error.code = Number(
        get(parsedResponseData, 'cResultado.Servicos.cServico.Erro', 0),
      );
      error.message = get(
        parsedResponseData,
        'cResultado.Servicos.cServico.MsgErro',
        '',
      );

      const shipmentCostAndDeadlineFromCorreiosByType: ShipmentCostAndDeadline =
        {
          type: shippingType,
          cost: parseFloat(
            get(
              parsedResponseData,
              'cResultado.Servicos.cServico.Valor',
              0,
            ).replace(/,/g, '.'),
          ),
          deadline: Number(
            get(
              parsedResponseData,
              'cResultado.Servicos.cServico.PrazoEntrega',
              0,
            ),
          ),
        };

      // 0 = no errors
      if (error.code !== 0) {
        throw new InternalServerErrorException(
          `Erro ao calcular o frete. ${error.message}`,
        );
      }

      return shipmentCostAndDeadlineFromCorreiosByType;

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError({
        action: 'ShipmentsService.getShipmentCostAndDeadlineFromCorreiosByType',
        error,
        model: params,
      });

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new InternalServerErrorException(
          `${get(
            error,
            'response.message',
            'Erro ao calcular o frete. Por favor, tente novamente mais tarde.',
          )}`,
        );
      } else if (error.request) {
        // No response
        throw new ServiceUnavailableException(
          'Erro ao calcular o frete. Serviço indisponível. Por favor, tente novamente mais tarde',
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new InternalServerErrorException(
          `Erro ao calcular o frete. Por favor, tente novamente mais tarde.`,
        );
      }

    }
  }

}
