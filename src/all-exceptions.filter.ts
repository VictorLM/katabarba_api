import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {

    // console.trace('TESTEEEEEEEEEEEEEEEEE', exception);
    // console.log('TEST', exception);
    // EVENT LOG DB - SCHEDULE IF > 5 UNREAD > SEND E-MAIL

    super.catch(exception, host);
  }
}
