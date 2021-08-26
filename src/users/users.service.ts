import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './models/user.schema';
import { ChangeUserPasswordDto, SignUpDto, UserBaseDto } from './dtos/user.dto';
import { ChangesService } from '../changes/changes.service';
import { Role } from '../auth/enums/role.enum';
import { AuthService } from '../auth/auth.service';
import { ErrorsService } from '../errors/errors.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private changesService: ChangesService,
    private errorsService: ErrorsService,
  ) {}

  async getUserById(id: Types.ObjectId): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de usuário "${id}" inválido`);
    }
    const found = await this.usersModel.findOne({
      _id: id,
      inactivated: null,
    }).select('-roles').exec();

    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getUserByIdWithPassword(id: Types.ObjectId): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de usuário "${id}" inválido`);
    }
    const found = await this.usersModel.findOne({
      _id: id,
      inactivated: null
    }).select('+password').exec();

    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getAdminUsersAndThrowIfErrors(): Promise<UserDocument[]> {
    const admins = await this.usersModel.find({
      inactivated: null,
      roles: { $in: [Role.ADMIN] },
    });

    if(admins.length < 1) {
      throw new NotFoundException('Nenhum administrador encontrado');
    } else if(admins.length > 10) {
      throw new InternalServerErrorException(`Número de admins > 10. ${admins.length} adiministradores encontrados! Verificar`);
    } else {
      return admins;
    }
  }

  // Método usado no AuthController e JWTStrategy
  async getUserByEmailWithPassword(email: string): Promise<UserDocument> {
    return await this.usersModel.findOne({
       email,
       inactivated: null,
    }).select('+password').exec();
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    const foundUser = await this.usersModel.findOne({
      email,
      inactivated: null,
    });

    if (!foundUser) {
      throw new NotFoundException(`Nenhum usuário com o email ${email} foi encontrado`);
    }

    return foundUser
  }

  // Método usado no AuthController
  async createUser(signUpDto: SignUpDto): Promise<void> {
    const { email, name, surname, password, cpf, phone } = signUpDto;
    const hashedPassword = await this.authService.hashPassword(password);

    const newUser = new this.usersModel({
      email,
      password: hashedPassword,
      name,
      surname,
      cpf, // TODO - CPF único?
      phone,
      roles: [Role.CUSTOMER], //  TODO - Os admins eu seto o role direto no DB
    });

    try {
      await newUser.save();

    } catch (error) {
      if (error.code === 11000) {
        // duplicate email - MongoDB
        throw new ConflictException('Email já cadastrado por outro usuário');
      } else {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError({
          action: 'UsersService.createUser',
          error,
          model: newUser,
        });
        throw new InternalServerErrorException('Erro ao cadastrar usuário. Por favor, tente novamente mais tarde');
      }
    }
  }

  async updateUser(
    userBaseDto: UserBaseDto,
    user: UserDocument,
  ): Promise<void> {
    const foundUser = await this.getUserById(user._id);
    // Log changes into DB - not awaiting
    this.changesService.createChange('users', 'User Update', { ...foundUser }, user._id);

    const { cpf, email, name, surname, phone } = userBaseDto;

    foundUser.cpf = cpf;
    foundUser.email = email;
    foundUser.name = name;
    foundUser.surname = surname;
    foundUser.phone = phone;

    try {
      await foundUser.save();

    } catch (error) {
      if (error.code === 11000) {
        // duplicate email
        throw new ConflictException('Email já cadastrado');
      } else {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError({
          user: user._id,
          action: 'UsersService.updateUser',
          error,
          model: foundUser,
        });
        throw new InternalServerErrorException(
          'Erro ao atualizar Usuário. Por favor, tente novamente mais tarde',
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

    if (await this.authService.passwordCompare(currentPassword, foundUser.password)) {

      // Log changes into DB - not awaiting
      this.changesService.createChange('users', 'User Password Update', { ...foundUser }, user._id);

      foundUser.password = await this.authService.hashPassword(newPassword);

      try {
        await foundUser.save();

      } catch (error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError({
          user: user._id,
          action: 'UsersService.updateUserPassword',
          error,
          model: foundUser,
        });
        throw new InternalServerErrorException(
          'Erro ao alterar senha. Por favor, tente novamente mais tarde',
        );
      }
    } else {
      throw new UnauthorizedException('Senha Atual inválida');
    }
  }

  async resetUserPassword(
    user: UserDocument,
    password: string,
  ): Promise<void> {
    // Log changes into DB - not awaiting
    this.changesService.createChange('users', 'User Password Reset', { ...user }, user._id);
    user.password = await this.authService.hashPassword(password);
    try {
      await user.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError({
        user: user._id,
        action: 'UsersService.resetUserPassword',
        error,
        model: user,
      });
      throw new InternalServerErrorException(
        'Erro ao redefinir senha. Por favor, tente novamente mais tarde',
      );
    }

  }

}
