import {
  Body,
  Controller,
  HttpCode,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';
import { EmailEventNotificationDTO } from './dtos/email-event-notification.dto';
import { CreateProductAvailableNotificationDTO } from './dtos/product-available-notification.dto';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private emailsService: EmailsService) {}

  // Para receber os POSTs do WebHook do MailJet
  @Post('/notifications')
  @HttpCode(200) // Required MailJet webhook response
  emailEventsNotificationWebHook(
    @Body(new ParseArrayPipe({ items: EmailEventNotificationDTO }))
    emailEventsNotificationDTO: EmailEventNotificationDTO[],
  ): Promise<void> {
    return this.emailsService.emailEventsNotificationWebHook(
      emailEventsNotificationDTO,
    );
  }

  @Post('/product-available-notification')
  createProductAvailableNotification(
    @Body()
    createProductAvailableNotificationDTO: CreateProductAvailableNotificationDTO,
  ): Promise<void> {
    return this.emailsService.createProductAvailableNotification(
      createProductAvailableNotificationDTO,
    );
  }

  @Post('/test')
  test() {
    return this.emailsService.test();
  }

}
