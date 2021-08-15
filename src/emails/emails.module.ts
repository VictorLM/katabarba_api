import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { ConfigModule } from '@nestjs/config';
import { ErrorsModule } from '../errors/errors.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './models/email.schema';
import { EmailEvent, EmailEventSchema } from './models/email-event.schema';
import { ProductAvailableNotification, ProductAvailableNotificationSchema } from './models/product-available-notification.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    ProductsModule,
    ConfigModule,
    ErrorsModule,
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
      { name: EmailEvent.name, schema: EmailEventSchema },
      { name: ProductAvailableNotification.name, schema: ProductAvailableNotificationSchema },
    ]),
  ],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService],
})
export class EmailsModule {}
