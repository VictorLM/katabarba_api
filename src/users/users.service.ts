import { Injectable } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { Address, AddressDocument } from './models/address.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressesModel: Model<AddressDocument>,
  ) {}

  async test(addressDto: AddressDto): Promise<void> {

    const user = await this.usersModel.findById('60ee2d0487ce7b0388d0be5f');

    // console.log(user);

    const { street, number, complement, city, state, zip } = addressDto;

    const address = new this.addressesModel({
      street,
      number,
      city,
      complement,
      state,
      zip,
      user: user.id,
    });

    await address.save();

    // user.address = address;

    // await this.usersRepository.save(user);

  }

}
