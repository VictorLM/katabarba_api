import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { HttpExceptionsService } from './http-exceptions/http-exceptions.service';
import { get } from 'lodash';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly httpExceptionsService: HttpExceptionsService) {
    super();
  };

  catch(exception: unknown, host: ArgumentsHost) {
    // not awaiting
    this.httpExceptionsService.createAppHttpException(get(exception, 'response', null));
    super.catch(exception, host);
  }
}
