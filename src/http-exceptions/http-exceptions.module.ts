import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorsModule } from '../errors/errors.module';
import { HttpExceptionsService } from './http-exceptions.service';
import { AppException, AppExceptionSchema } from './models/http-exception.schema';

@Global()
@Module({
  imports: [
    ErrorsModule,
    MongooseModule.forFeature([
      { name: AppException.name, schema: AppExceptionSchema },
    ]),
  ],
  providers: [HttpExceptionsService],
  exports: [HttpExceptionsService],
})
export class HttpExceptionsModule {}
