import { Body, Controller, HttpCode, Post, } from '@nestjs/common';
import { EmailEventNotificationDTO, EmailEventsNotificationDTO } from './dtos/email-event-notification.dto';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private emailsService: EmailsService) {}

  // Para receber os POSTs do WebHook do MailJet
  // WEBHOOK - TODO

  @Post('/notifications')
  emailEventsNotificationWebHook(
    @Body() emailEventsNotificationDTO: EmailEventsNotificationDTO,
  ) {
    console.log('PASSOU!', emailEventsNotificationDTO);
  }

  // @Post('/notifications')
  // @HttpCode(200) // Required MeiJet webhook response
  // emailEventsNotificationWebHook(
  //   @Body() emailEventsNotificationDTO: EmailEventNotificationDTO[],
  // ): Promise<void> {
  //   return this.emailsService.emailEventsNotificationWebHook(emailEventsNotificationDTO);
  // }

  // @Post('/test')
  // test(@Body() test: TestDTO[]) {
  //   console.log('Teste');
  // }

}
