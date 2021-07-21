import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../addresses/models/address.schema';
import { AddressesService } from './addresses.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
    ]),
  ],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
