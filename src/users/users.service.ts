import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AddressDto } from '../addresses/dtos/address.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { Address, AddressDocument } from '../addresses/models/address.schema';
import { ChangeUserPasswordDto, SignUpDto, UserBaseDto } from './dtos/user.dto';
import { ChangesService } from '../changes/changes.service';
import { Role } from '../auth/enums/role.enum';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(Address.name) private addressesModel: Model<AddressDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
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

  // Método usado no AuthController e JWTStrategy
  async getUserByEmailWithPassword(email: string): Promise<UserDocument> {
    return await this.usersModel.findOne({ email }).select('+password');
  }

  // Método usado no AuthController
  async createUser(signUpDto: SignUpDto): Promise<void> {
    const { email, name, password, cpf, phone } = signUpDto;
    const hashedPassword = await this.authService.hashPassword(password);

    const newUser = new this.usersModel({
      email,
      password: hashedPassword,
      name,
      cpf, // TODO - CPF único?
      phone,
      roles: [Role.CUSTOMER], // Os admin eu seto o role direto no DB
    });

    try {
      await newUser.save();

    } catch (error) {
      if (error.code === 11000) {
        // duplicate email - MongoDB
        throw new ConflictException('Email já cadastrado por outro usuário');
      } else {
        console.log(error);
        throw new InternalServerErrorException('Erro ao cadastrar usuário. Por favor, tente novamente mais tarde');
      }
    }
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

    if (await this.authService.passwordCompare(currentPassword, foundUser.password)) {

      foundUser.password = await this.authService.hashPassword(newPassword);

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

  protected async getAddressById(id: string): Promise<AddressDocument> {
    const found = await this.addressesModel.findById(id);
    if (!found) {
      throw new NotFoundException(`Endereço com ID "${id}" não encontrado`);
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
