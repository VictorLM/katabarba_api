import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SiteModule } from './site/site.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ChangesModule } from './changes/changes.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { AddressesModule } from './addresses/addresses.module';
import { CompaniesModule } from './companies/companies.module';
import { PaymentsModule } from './payments/payments.module';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';
import { AdminModule } from './admin/admin.module';
import { EmailsModule } from './emails/emails.module';
import { ErrorsModule } from './errors/errors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.stage.${process.env.STAGE}`],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }),
    }),
    SiteModule,
    AuthModule,
    ChangesModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    ShipmentsModule,
    AddressesModule,
    CompaniesModule,
    PaymentsModule,
    MercadoPagoModule,
    AdminModule,
    EmailsModule,
    ErrorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
