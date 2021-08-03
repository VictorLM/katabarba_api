import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangesService } from '../changes/changes.service';
import { UserDocument } from '../users/models/user.schema';
import { AddressDto } from './dtos/address.dto';
import { Address, AddressDocument } from './models/address.schema';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private addressesModel: Model<AddressDocument>,
    private changesService: ChangesService,
  ) {}

  async getAddressByUserAndErrorIfNotExists(user: UserDocument): Promise<AddressDocument> {
    const found = await this.addressesModel.findOne({ user: user._id });
    if (!found) {
      throw new NotFoundException(`Usuário com ID "${user._id}" não tem endereço cadastrado`);
    }
    return found;
  }

  private async getAddressByUser(user: UserDocument): Promise<AddressDocument> {
    return await this.addressesModel.findOne({ user: user._id });
  }

  // private async getAddressById(id: Types.ObjectId): Promise<AddressDocument> { // TODO - Está sendo usado?
  //   if (!Types.ObjectId.isValid(id)) {
  //     throw new BadRequestException(`ID de endereço "${id}" inválido`);
  //   }

  //   const found = await this.addressesModel.findById(id);

  //   if (!found) {
  //     throw new NotFoundException(`Endereço com ID "${id}" não encontrado`);
  //   }
  //   return found;
  // }

  async createAddress(
    addressDto: AddressDto,
    user: UserDocument,
  ): Promise<AddressDocument> {
    const foundAddress = await this.getAddressByUser(user);

    if(!foundAddress) {
      const { street, number, complement, city, state, zipCode } = addressDto;
      const newAddress = new this.addressesModel({
        street,
        number,
        city,
        complement,
        state,
        zipCode,
        user: user._id,
      });
      return await newAddress.save();

    } else {
      throw new ConflictException('Usuário já tem endereço cadastrado');
    }
  }

  async updateAddress(
    addressDto: AddressDto,
    user: UserDocument,
  ): Promise<AddressDocument> {
    const foundAddress = await this.getAddressByUser(user);

    if(foundAddress) {
      const { street, number, complement, city, state, zipCode } = addressDto;
      // Log changes
      await this.changesService.createChange({
        user: user._id,
        collectionName: 'addresses',
        type: 'Address Update',
        before: foundAddress
      });
      //
      foundAddress.street = street;
      foundAddress.number = number;
      foundAddress.city = city;
      foundAddress.complement = complement;
      foundAddress.state = state;
      foundAddress.zipCode = zipCode;

      return await foundAddress.save();

    } else {
      throw new NotFoundException(`Nenhum endereço encontrado para o Usuário com ID "${user._id}"`);
    }

  }

}
