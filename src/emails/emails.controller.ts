import { Controller, Get, UseGuards } from '@nestjs/common';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { Role } from '../auth/enums/role.enum';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
import { EmailsService } from './emails.service';

@Controller('emails')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.CUSTOMER)
export class EmailsController {
  constructor(private emailsService: EmailsService) {}

  // @Get('/')
  // getAddressByUser() {
  //   return this.emailsService.test();
  // }
}
