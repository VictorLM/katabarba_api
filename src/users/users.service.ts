import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
// import { AddressCreateDto } from './dto/address-create.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { Address, AddressDocument } from './models/address.schema';
import { UserBaseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressesModel: Model<AddressDocument>,
  ) {}

  async getUserById(id: string): Promise<UserDocument> {
    const found = await this.usersModel.findById(id);
    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async updateUser(userBaseDto: UserBaseDto, id: string): Promise<UserDocument> {
    const { cpf, email, name, phone } = userBaseDto;
    try {
      const updatedUser = await this.usersModel.findOneAndUpdate(
        { _id: id },{
          email,
          name,
          cpf,
          phone
        },{
          new: true,
          useFindAndModify: false
        }
      );
      return updatedUser;
    } catch (error) {
      if (error.code === 11000) {
        // duplicate email
        throw new ConflictException('Email já cadastrado');
      } else {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }

  }

  async updateUserPassword(): Promise<void> {
    // isolar função hash bcrypt num utility
  }

  // async test(addressCreateDto: AddressCreateDto): Promise<void> {
  //   const user = await this.getUserById('60ee2d0487ce7b0388d0be5f');
  //   console.log(user);
  //   const { street, number, complement, city, state, zip } = addressDto;

  //   const address = new this.addressesModel({
  //     street,
  //     number,
  //     city,
  //     complement,
  //     state,
  //     zip,
  //     user: user._id,
  //   });

  //   await address.save();
  // }

}
