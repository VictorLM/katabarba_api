import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorsService } from '../errors/errors.service';
import { AppException, AppExceptionDocument } from './models/http-exception.schema';

@Injectable()
export class HttpExceptionsService {
  constructor(
    @InjectModel(AppException.name) private appExceptionsModel: Model<AppExceptionDocument>,
    private errorsService: ErrorsService,
  ) {}

  async createAppHttpException(exception: unknown): Promise<void> {
    const newAppHttpException = new this.appExceptionsModel({ exception });

    try {
      await newAppHttpException.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'HttpExceptionsService.createAppHttpException',
        error,
        newAppHttpException,
      );
    }

  }
}
