import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorsService } from '../errors/errors.service';
import { CreateChangeDTO } from './dtos/create-change.dto';
import { Change, ChangeDocument } from './models/change.schema';

@Injectable()
export class ChangesService {
  constructor(
    @InjectModel(Change.name) private changesModel: Model<ChangeDocument>,
    private errorsService: ErrorsService,
  ) {}

  async createChange(createChangeDTO: CreateChangeDTO): Promise<void> {
    const { collectionName, type, beforeDoc, user } = createChangeDTO;
    const before = { ...beforeDoc._doc }; // Sendo uma deep copy de um mongoose document da pra acessar essa prop ._doc

    const newChange = new this.changesModel({
      collectionName,
      type,
      before,
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
