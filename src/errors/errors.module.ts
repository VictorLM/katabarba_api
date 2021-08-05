import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorsService } from './errors.service';
import { AppError, AppErrorSchema } from './models/app-error.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppError.name, schema: AppErrorSchema },
    ]),
  ],
  providers: [ErrorsService],
  exports: [ErrorsService],
})
export class ErrorsModule {}
