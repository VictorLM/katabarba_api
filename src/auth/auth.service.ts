import { forwardRef, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from '../users/dtos/user.dto';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<void> {
    await this.usersService.createUser(signUpDto);
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const { email, password } = signInDto;
    const user = await this.usersService.getUserByEmailWithPassword(email);

    if (user && (await this.passwordCompare(password, user.password))) {
      const payload: JwtPayload = { email };
      const accessToken: string = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Email e/ou senha inválidos');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt();
    const hashedPassword: string = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async passwordCompare(
    inputedPassword: string,
    savedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(inputedPassword, savedPassword);
  }

}
