import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AddressDto } from '../addresses/dtos/address.dto';
import { ChangeUserPasswordDto, UserBaseDto } from './dtos/user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { AddressDocument } from '../addresses/models/address.schema';
import { UserDocument } from './models/user.schema';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class UsersController {
  constructor(private usersService: UsersService) {}

  //USERS

  @Get('/')
  getUser(@GetUser() user: UserDocument): Promise<UserDocument> {
    return this.usersService.getUserById(user._id);
  }

  @Patch('/update') // TODO - If mudar o ID do user na req.user? Testar
  updateUser(
    @Body() userBaseDto: UserBaseDto,
    @GetUser() user: UserDocument
  ): Promise<UserDocument> {
    return this.usersService.updateUser(userBaseDto, user);
  }

  @Patch('/update-password') // TODO - If mudar o ID do user na req.user? Testar
  updateUserPassword(
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
    @GetUser() user: UserDocument
  ): Promise<void> {
    return this.usersService.updateUserPassword(changeUserPasswordDto, user);
  }

  // ADDRESSES

  @Get('/address')
  getAddressByUser(@GetUser() user: UserDocument): Promise<AddressDocument> {
    return this.usersService.getAddressByUser(user);
  }

  @Post('/address')
  createAddress(
    @Body() addressDto: AddressDto,
    @GetUser() user: UserDocument
  ): Promise<AddressDocument> {
    return this.usersService.createAddress(addressDto, user);
  }

  @Patch('/address')
  updateAddress(
    @Body() addressDto: AddressDto,
    @GetUser() user: UserDocument
  ): Promise<AddressDocument> {
    return this.usersService.updateAddress(addressDto, user);
  }

}
