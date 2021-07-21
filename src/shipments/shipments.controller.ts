import { Body, Controller, Post } from '@nestjs/common';
import { ProductOrder } from '../products/dtos/product.dto';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
  constructor(private shipmentsService: ShipmentsService) {}

  @Post('/')
  publicGetShipmentCosts(
    @Body() publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO
): Promise<void> {
    return this.shipmentsService.publicGetShipmentCosts(publicGetShipmentCostsDTO);
  }
}
