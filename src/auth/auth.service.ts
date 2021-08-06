import { forwardRef, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from '../users/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { ErrorsService } from '../errors/errors.service';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private errorsService: ErrorsService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    await this.usersService.createUser(signUpDto);
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;
    const user = await this.usersService.getUserByEmailWithPassword(email);

    // TODO - LOGIN EVENT TO DB

    try {
      if (user && (await this.passwordCompare(password, user.password))) {
        const payload: JwtPayload = { email };
        const accessToken: string = this.jwtService.sign(payload);
        return { accessToken };
      } else {
        throw new UnauthorizedException('Email e/ou senha inválidos');
      }

    } catch(error) {
      console.log(error);

      // Log error into DB - not await
      this.errorsService.createAppError(
        user._id,
        'AuthService.signIn',
        error,
        user,
      );

      throw new InternalServerErrorException(
        'Erro ao processar o login. Por favor, tente novamente mais tarde',
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

}
