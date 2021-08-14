import { Body, Controller, HttpCode, ParseArrayPipe, Post, } from '@nestjs/common';
import { EmailEventNotificationDTO } from './dtos/email-event-notification.dto';
import { EmailsService } from './emails.service';

@Controller('emails')
export class EmailsController {
  constructor(private emailsService: EmailsService) {}

  // Para receber os POSTs do WebHook do MailJet
  // WEBHOOK - TODO

  @Post('/notifications')
  @HttpCode(200) // Required MailJet webhook response
  emailEventsNotificationWebHook(
    @Body(new ParseArrayPipe({ items: EmailEventNotificationDTO }))
    emailEventsNotificationDTO: EmailEventNotificationDTO[],
  ): Promise<void> {
    return this.emailsService.emailEventsNotificationWebHook(emailEventsNotificationDTO);
  }

  // @Post('/test')
  // test(@Body() test: TestDTO[]) {
  //   console.log('Teste');
  // }

}
