import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangesService } from '../changes/changes.service';
import { ErrorsService } from '../errors/errors.service';
import { UserDocument } from '../users/models/user.schema';
import { AddressDto } from './dtos/address.dto';
import { Address, AddressDocument } from './models/address.schema';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private addressesModel: Model<AddressDocument>,
    private changesService: ChangesService,
    private errorsService: ErrorsService,
  ) {}

  async getAddressByUserAndErrorIfNotExists(user: UserDocument): Promise<AddressDocument> {
    const found = await this.addressesModel.findOne({ user: user._id });
    if (!found) {
      throw new NotFoundException(`Usuário com ID "${user._id}" não tem endereço cadastrado`);
    }
    return found;
  }

  private async getAddressByUser(user: UserDocument): Promise<AddressDocument> {
    // Não levantando error para checar if empty
    // Para levantar erro usar o método acima getAddressByUserAndErrorIfNotExists()
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
      const { street, number, district, complement, city, state, zipCode } = addressDto;
      const newAddress = new this.addressesModel({
        street,
        number,
        district,
        city,
        complement,
        state,
        zipCode,
        user: user._id, // Para não retornar tudo do user
      });

      try {
        return await newAddress.save();

      } catch (error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError(
          user._id,
          'AddressesService.createAddress',
          error,
          newAddress,
        );

        throw new InternalServerErrorException(
          'Erro ao salvar novo Endereço. Por favor, tente novamente mais tarde',
        );
      }

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
      // Log changes into DB - not awaiting
      this.changesService.createChange('addresses', 'Address Update', { ...foundAddress }, user._id);

      const { street, number, district, complement, city, state, zipCode } = addressDto;

      foundAddress.street = street;
      foundAddress.number = number;
      foundAddress.district = district;
      foundAddress.city = city;
      foundAddress.complement = complement;
      foundAddress.state = state;
      foundAddress.zipCode = zipCode;

      try {
        return await foundAddress.save();

      } catch (error) {
        console.log(error);

        // Log error into DB - not await
        this.errorsService.createAppError(
          user._id,
          'AddressesService.updateAddress',
          error,
          foundAddress,
        );

        throw new InternalServerErrorException(
          'Erro ao atualizar Endereço. Por favor, tente novamente mais tarde',
        );
      }

    } else {
      throw new NotFoundException(`Nenhum endereço encontrado para o Usuário com ID "${user._id}"`);
    }

  }

}
