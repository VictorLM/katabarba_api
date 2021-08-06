import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { CreateTextDto } from '../site/texts/dto/create-text.dto';
import { Text, TextDocument } from './models/text.schema';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Text.name) private textsModel: Model<TextDocument>,
  ) {}

  async getTexts(): Promise<TextDocument[]> {
    return this.textsModel.find();
  }
    // async createText(createTextDto: CreateTextDto): Promise<Text> {
  //   const { section, title, text } = createTextDto;

  //   const newText = new this.textsModel({
  //     section,
  //     title,
  //     text,
  //   });

  //   return newText.save();
  // }

}
