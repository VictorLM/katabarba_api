import { Body, Controller, Post } from '@nestjs/common';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { ShipmentsCostsAndDeadlines } from './interfaces/shipping-costs.interface';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Post('/')
  publicGetShipmentCosts(
    @Body() publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO
): Promise<ShipmentsCostsAndDeadlines> {
    return this.shipmentsService.publicGetShipmentsCosts(publicGetShipmentCostsDTO);
  }
}
