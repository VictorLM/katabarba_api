import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { Shipment, ShipmentDocument } from './models/shipment.schema';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private shipmentsModel: Model<ShipmentDocument>,
  ) {}

  async publicGetShipmentCosts(
    publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO
  ): Promise<void> {
    const { deliveryZipCode, products } = publicGetShipmentCostsDTO;
    console.log('ZIPAO: ', deliveryZipCode);
    console.log('PRODUCTOES: ', JSON.stringify(products));
  }

}
