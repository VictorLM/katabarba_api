import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MercadoPagoService } from './mercado-pago.service';

@Module({
  imports: [ConfigModule],
  providers: [MercadoPagoService]
})
export class MercadoPagoModule {}
