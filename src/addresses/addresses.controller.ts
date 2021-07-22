import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../users/decorators/get-user.decorator';
import { UserDocument } from '../users/models/user.schema';
import { AddressesService } from './addresses.service';
import { AddressDto } from './dtos/address.dto';
import { AddressDocument } from './models/address.schema';

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get('/')
  getAddressByUser(@GetUser() user: UserDocument): Promise<AddressDocument> {
    return this.addressesService.getAddressByUserAndErrorIfNotExists(user);
  }

  @Post('/')
  createAddress(
    @Body() addressDto: AddressDto,
    @GetUser() user: UserDocument
  ): Promise<AddressDocument> {
    return this.addressesService.createAddress(addressDto, user);
  }

  @Patch('/')
  updateAddress(
    @Body() addressDto: AddressDto,
    @GetUser() user: UserDocument
  ): Promise<AddressDocument> {
    return this.addressesService.updateAddress(addressDto, user);
  }

}
