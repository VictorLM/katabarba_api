import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../addresses/models/address.schema';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { ChangesModule } from '../changes/changes.module';

@Module({
  imports: [
    ChangesModule,
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  providers: [AddressesService],
  exports: [AddressesService],
  controllers: [AddressesController],
})
export class AddressesModule {}
