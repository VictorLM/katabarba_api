import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { SignUpDto } from '../users/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { ErrorsService } from '../errors/errors.service';
import { InjectModel } from '@nestjs/mongoose';
import { PasswordResetToken, PasswordResetTokenDocument } from './models/password-reset-token.schema';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';
import {
  CreatePasswordResetTokenDTO,
  PasswordResetDTO,
  NewPasswordResetTokenDTO
} from './dtos/password-reset.dto';
import { UserDocument } from '../users/models/user.schema';
import { EmailsService } from '../emails/emails.service';
import { Login, LoginDocument } from './models/login.schema';
import { LoginResult } from './enums/login-result.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(PasswordResetToken.name)
    private passwordResetTokensModel: Model<PasswordResetTokenDocument>,
    @InjectModel(Login.name)
    private loginModel: Model<LoginDocument>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private errorsService: ErrorsService,
    private emailsService: EmailsService,

  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    await this.usersService.createUser(signUpDto);
  }

  async signIn(
    signInDto: SignInDto,
    ip: string,
    agent: string,
  ): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;
    const user = await this.usersService.getUserByEmailWithPassword(email);
    // Tirei o try catch porque ao lançar o erro estava caindo no catch
    if (user && (await this.passwordCompare(password, user.password))) {
      const payload: JwtPayload = { email };
      const accessToken: string = this.jwtService.sign(payload);
      // login to DB - not await
      this.createLogin(user, ip, agent, LoginResult.SUCCESS);
      return { accessToken };

    } else {
      // login to DB - not await
      this.createLogin(user, ip, agent, LoginResult.FAIL);
      throw new UnauthorizedException('Email e/ou senha inválidos');
    }
  }

  async createLogin(
    user: UserDocument,
    ip: string,
    agent: string,
    result: LoginResult,
  ): Promise<void> {
    const newLogin = new this.loginModel({
      user,
      ip,
      agent,
      result,
    });

    try {
      await newLogin.save();

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.createLogin',
        error,
        newLogin,
      );
    }
  }

  // Password Reset tokens
  async newPasswordResetToken(newPasswordResetTokenDTO: NewPasswordResetTokenDTO) {
    const { email } = newPasswordResetTokenDTO;
    const foundUser = await this.usersService.getUserByEmailWithPassword(email);

    if(!foundUser) {
      throw new NotFoundException('Nenhum usuário cadastrado com o email informado');
    }

    const foundToken = await this.getPasswordResetTokenByUserAndPopulate(foundUser);

    if(foundToken) {
      await this.emailsService.sendPasswordResetEmail(foundToken);

    } else {
      const randomString = randomBytes(32).toString('hex');
      const newPasswordResetToken = await this.createPasswordResetToken({
        user: foundUser,
        token: randomString,
      });

      await this.emailsService.sendPasswordResetEmail(newPasswordResetToken);

      const hashedToken = await this.hashToken(randomString);
      newPasswordResetToken.token = hashedToken;
      await newPasswordResetToken.save();
    }
  }

  async passwordReset(passwordResetDTO: PasswordResetDTO): Promise<void> {
    const { userId, token, password } = passwordResetDTO;
    const foundUser = await this.usersService.getUserById(userId);
    const foundPasswordResetToken = await this.getPasswordResetTokenByUserAndPopulate(foundUser);

    if(!foundPasswordResetToken) {
      throw new NotFoundException('Token inválido');
    }

    if(await this.tokenCompare(token, foundPasswordResetToken.token)) {
      try {
        await this.usersService.resetUserPassword(foundUser, password);
        await foundPasswordResetToken.delete();
        // TODO - E-MAIL AVISANDO SOBRE TROCA DA SENHA
      } catch(error) {
        console.log(error);
        // Log error into DB - not await
        this.errorsService.createAppError(
          userId,
          'AuthService.passwordReset',
          error,
          passwordResetDTO,
        );
        throw new InternalServerErrorException(
          'Erro ao processar a recuperação de senha. Por favor, tente novamente mais tarde',
        );
      }
    } else {
      throw new NotFoundException('Token inválido');
    }
  }

  async createPasswordResetToken(
    createPasswordResetTokenDTO: CreatePasswordResetTokenDTO
  ): Promise<PasswordResetTokenDocument> {
    const newPasswordResetToken = new this.passwordResetTokensModel(createPasswordResetTokenDTO);

    try {
      return await newPasswordResetToken.save();

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.createPasswordResetToken',
        error,
        createPasswordResetTokenDTO,
      );

      throw new InternalServerErrorException(
        'Erro ao processar a recuperação de senha. Por favor, tente novamente mais tarde',
      );
    }
  }

  async getPasswordResetTokenByUserAndPopulate(user: UserDocument): Promise<PasswordResetTokenDocument> {
    try {
      return await this.passwordResetTokensModel.findOne({ user }).populate('user');

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.getPasswordResetTokenByUser',
        error,
        user,
      );

      throw new InternalServerErrorException(
        'Erro ao processar a recuperação de senha. Por favor, tente novamente mais tarde',
      );
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const salt: string = await bcrypt.genSalt();
      const hashedPassword: string = await bcrypt.hash(password, salt);
      return hashedPassword;

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.hashPassword',
        error,
        null,
      );

      throw new InternalServerErrorException(
        'Erro ao processar a senha. Por favor, tente novamente mais tarde',
      );
    }
  }

  async passwordCompare(
    inputedPassword: string,
    savedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(inputedPassword, savedPassword);

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.passwordCompare',
        error,
        null,
      );

      throw new InternalServerErrorException(
        'Erro ao processar a senha. Por favor, tente novamente mais tarde',
      );
    }
  }

  async hashToken(token: string): Promise<string> {
    try {
      const salt: string = await bcrypt.genSalt();
      const hashedToken: string = await bcrypt.hash(token, salt);
      return hashedToken;

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.hashToken',
        error,
        { token },
      );

      throw new InternalServerErrorException(
        'Erro ao processar token. Por favor, tente novamente mais tarde',
      );
    }
  }

  async tokenCompare(
    inputToken: string,
    savedToken: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(inputToken, savedToken);

    } catch(error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'AuthService.tokenCompare',
        error,
        null,
      );

      throw new InternalServerErrorException(
        'Erro ao processar token. Por favor, tente novamente mais tarde',
      );
    }
  }

}
