import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { Address, AddressDocument } from './models/address.schema';
import { ChangeUserPasswordDto, UserBaseDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { ChangesService } from '../changes/changes.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressesModel: Model<AddressDocument>,
    private changesService: ChangesService,
  ) {}

  // USERS

  async getUserById(id: string): Promise<UserDocument> {
    const found = await this.usersModel.findById(id);
    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getUserByIdWithPassword(id: string): Promise<UserDocument> {
    const found = await this.usersModel.findById(id).select('+password').exec();
    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async updateUser(
    userBaseDto: UserBaseDto,
    user: UserDocument,
  ): Promise<UserDocument> {
    const { cpf, email, name, phone } = userBaseDto;
    // TODO - Atualizar req.user logo depois de atualizar o user
    try {
      const updatedUser = await this.usersModel.findOneAndUpdate(
        { _id: user._id },
        {
          email,
          name,
          cpf,
          phone,
        },
        {
          new: true,
          useFindAndModify: false,
        },
      );
      // Log changes
      await this.changesService.createChange({
        user: user._id,
        collectionName: 'users',
        type: 'User Update',
        before: user
      });
      //
      return updatedUser;

    } catch (error) {
      if (error.code === 11000) {
        // duplicate email
        throw new ConflictException('Email já cadastrado');
      } else {
        console.log(error);
        throw new InternalServerErrorException(
          'Erro ao alterar usuário. Por favor, tente novamente mais tarde',
        );
      }
    }
  }

  async updateUserPassword(
    changeUserPasswordDto: ChangeUserPasswordDto,
    user: UserDocument,
  ): Promise<void> {
    // TODO - TESTARRRR POR CONTA DO JWT E PASSPORT - Revalidar token?
    // REDIRECT LOGIN FRONT?
    const foundUser = await this.getUserByIdWithPassword(user._id);
    const { currentPassword, newPassword } = changeUserPasswordDto;
    user.password = foundUser.password; // changes

    if (await bcrypt.compare(currentPassword, foundUser.password)) {
      const salt = await bcrypt.genSalt();
      foundUser.password = await bcrypt.hash(newPassword, salt);

      try {
        await foundUser.save();
        // Log changes
        await this.changesService.createChange({
          user: user._id,
          collectionName: 'users',
          type: 'User Password Update',
          before: user
        });
        //
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'Erro ao alterar senha. Por favor, tente novamente mais tarde',
        );
      }
    } else {
      throw new UnauthorizedException('Senha Atual inválida');
    }
  }

  // ADDRESSES

  async getAddressByUser(user: UserDocument): Promise<AddressDocument> {
    // IF EMPTY? No front, redirect para cadastro endereço?
    return await this.addressesModel.findOne({ user: user._id }).exec();
    // Não retornando 404 por que o user não tem address ao ser criado
  }

  async getAddressByUserAndErrorIfNotExists(user: UserDocument): Promise<AddressDocument> {
    const found = await this.addressesModel.findOne({ user: user._id }).exec();
    if (!found) {
      throw new NotFoundException(`Usuário com ID "${user._id}" não tem endereço cadastrado`);
    }
    return found;
  }

  async createAddress(
    addressDto: AddressDto,
    user: UserDocument,
  ): Promise<AddressDocument> {
    const foundUser = await this.getUserById(user._id);
    const foundAddress = await this.getAddressByUser(user);

    if(!foundAddress) {
      const { street, number, complement, city, state, zip } = addressDto;
      const newAddress = new this.addressesModel({
        street,
        number,
        city,
        complement,
        state,
        zip,
        user: foundUser._id,
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
    const foundUser = await this.getUserById(user._id);
    const foundAddress = await this.getAddressByUser(foundUser);

    if(foundAddress) {
      const { street, number, complement, city, state, zip } = addressDto;
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
      foundAddress.zip = zip;

      return await foundAddress.save();

    } else {
      throw new NotFoundException(`Nenhum endereço encontrado para o Usuário com ID "${user._id}"`);
    }

  }
}
