import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ErrorsService } from '../errors/errors.service';
import { Change, ChangeDocument } from './models/change.schema';

@Injectable()
export class ChangesService {
  constructor(
    @InjectModel(Change.name) private changesModel: Model<ChangeDocument>,
    private errorsService: ErrorsService,
  ) {}

  async createChange(
    collectionName: string,
    type: string,
    before: any, // Tem que ser uma deep copy de um Mongoose Document com spread operator { ...document }
    user: Types.ObjectId,
  ): Promise<void> {
    const beforeDoc = { ...before._doc }; // Sendo uma deep copy de um mongoose document da pra acessar essa prop ._doc
    const newChange = new this.changesModel({
      collectionName,
      type,
      before: beforeDoc,
      user,
    });

    try {
      await newChange.save();

    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.errorsService.createAppError({
        action: 'ChangesService.createChange',
        error,
        model: newChange,
      });
    }
  }

}
