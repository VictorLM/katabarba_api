import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTextDto } from '../site/texts/dto/create-text.dto';
import { Text } from '../site/texts/text.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class SiteService {

  constructor(
    @InjectRepository(Text)
    private readonly textRepository: MongoRepository<Text>,
  ) {}

  async getTexts(): Promise<Text[]> {
    return this.textRepository.find();
  }

  async createText(createTextDto: CreateTextDto): Promise<Text> {
    const { section, title, text } = createTextDto;
    const newText = this.textRepository.create({
      section,
      title,
      text,
    });

    return this.textRepository.save(newText);
  }

}
