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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private changesService: ChangesService,
  ) {}

  // USERS

  async getUserById(id: Types.ObjectId): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de usuário "${id}" inválido`);
    }

    const found = await this.usersModel.findById(id);

    if (!found) {
      throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getUserByIdWithPassword(id: Types.ObjectId): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de usuário "${id}" inválido`);
    }

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
    const { email, name, surname, password, cpf, phone } = signUpDto;
    const hashedPassword = await this.authService.hashPassword(password);

    const newUser = new this.usersModel({
      email,
      password: hashedPassword,
      name,
      surname,
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
    const { cpf, email, name, surname, phone } = userBaseDto;
    // TODO - Atualizar req.user logo depois de atualizar o user
    try {
      const updatedUser = await this.usersModel.findOneAndUpdate(
        { _id: user._id },
        {
          email,
          name,
          surname,
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

}
