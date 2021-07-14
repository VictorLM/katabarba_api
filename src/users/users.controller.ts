import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserBaseDto } from './dto/user.dto';
// import { AddressCreateDto } from './dto/address-create.dto';
import { UserDocument } from './models/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('/update')
  updateUser(@Body() userBaseDto: UserBaseDto): Promise<UserDocument> {
    return this.usersService.updateUser(userBaseDto, '60ef2bee1a4a98192ca72667');
  }

  // @Post('/signup')
  // signUp(@Body() signUpDto: SignUpDto): Promise<void> {
  //   return this.usersService.signUp(signUpDto);
  // }

  // delete user - TODO? - Se não tiver, é dark pattern - Desativar?
}
