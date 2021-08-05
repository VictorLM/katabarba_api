import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppError, AppErrorDocument } from './models/app-error.schema';

@Injectable()
export class ErrorsService {
  constructor(
    @InjectModel(AppError.name) private errorsModel: Model<AppErrorDocument>,
  ) {}

  // TODO - Notification
  async createAppError(
    userId: Types.ObjectId | null,
    action: string,
    error: Error,
  ): Promise<void> {
    const newError = new this.errorsModel({
      user: userId,
      action,
      error,
    });

    await newError.save();
  }

}
