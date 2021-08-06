import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ErrorsModule } from '../errors/errors.module';
import { MercadoPagoService } from './mercado-pago.service';

@Module({
  imports: [
    ErrorsModule,
    ConfigModule,
  ],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
