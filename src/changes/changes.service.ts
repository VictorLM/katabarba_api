import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorsService } from '../errors/errors.service';
import { ChangeDto } from './dtos/change.dto';
import { Change, ChangeDocument } from './models/change.schema';

@Injectable()
export class ChangesService {
  constructor(
    @InjectModel(Change.name) private changesModel: Model<ChangeDocument>,
    private errorsService: ErrorsService,
  ) {}

  // TODO - REFACTOR TO WORK WITHOUT AWAIT
  async createChange(changeDto: ChangeDto): Promise<void> {
    const newChange = new this.changesModel(changeDto);
    try {
      await newChange.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError(
        null,
        'ChangesService.createChange',
        error,
        newChange,
      );
    }
  }

}
