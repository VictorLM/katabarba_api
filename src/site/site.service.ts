import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './texts/models/company.schema';
// import { CreateTextDto } from '../site/texts/dto/create-text.dto';
import { Text, TextDocument } from './texts/models/text.schema';

@Injectable()
export class SiteService {
  constructor(
    @InjectModel(Company.name) private companiesModel: Model<CompanyDocument>,
    @InjectModel(Text.name) private textsModel: Model<TextDocument>,
  ) {}

  async getMainCompany(): Promise<CompanyDocument> {
    return this.companiesModel.findOne(
      {
        inactive: null,
        main: { $ne: null },
      }
    );
  }

  async getTexts(): Promise<TextDocument[]> {
    return this.textsModel.find().exec();
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
