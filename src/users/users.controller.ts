import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/test')
  signUp(@Body() addressDto: AddressDto): Promise<void> {
    return this.usersService.test(addressDto);
  }

  // @Post('/signup')
  // signUp(@Body() signUpDto: SignUpDto): Promise<void> {
  //   return this.usersService.signUp(signUpDto);
  // }

  // delete user - TODO
}
