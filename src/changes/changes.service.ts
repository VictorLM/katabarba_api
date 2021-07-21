import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangeDto } from './dtos/change.dto';
import { Change, ChangeDocument } from './models/change.schema';

@Injectable()
export class ChangesService {
  constructor(
    @InjectModel(Change.name) private changesModel: Model<ChangeDocument>,
  ) {}

  async createChange(changeDto: ChangeDto): Promise<void> {
    const newChange = new this.changesModel(changeDto);
    await newChange.save();
  }

}
