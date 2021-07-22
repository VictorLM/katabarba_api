import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChangeUserPasswordDto, UserBaseDto } from './dtos/user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { UserDocument } from './models/user.schema';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Create está no AuthController

  @Get('/')
  getUser(@GetUser() user: UserDocument): Promise<UserDocument> {
    return this.usersService.getUserById(user._id);
  }

  @Patch('/update')
  updateUser(
    @Body() userBaseDto: UserBaseDto,
    @GetUser() user: UserDocument
  ): Promise<UserDocument> {
    return this.usersService.updateUser(userBaseDto, user);
  }

  @Patch('/update-password')
  updateUserPassword(
    @Body() changeUserPasswordDto: ChangeUserPasswordDto,
    @GetUser() user: UserDocument
  ): Promise<void> {
    return this.usersService.updateUserPassword(changeUserPasswordDto, user);
  }

}
