import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { ConfigModule } from '@nestjs/config';
import { ErrorsModule } from '../errors/errors.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Email, EmailSchema } from './models/email.schema';

@Module({
  imports: [
    ConfigModule,
    ErrorsModule,
    MongooseModule.forFeature([
      { name: Email.name, schema: EmailSchema },
    ]),
  ],
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService],
})
export class EmailsModule {}
