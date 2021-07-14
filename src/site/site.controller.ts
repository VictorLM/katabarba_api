import { Body, Controller, Get, Post } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateTextDto } from './texts/dto/create-text.dto';
import { Text } from './texts/text.schema';

@Controller('site')
export class SiteController {
  constructor(
    private siteService: SiteService,
  ) {}

  @Get('/texts')
  getTexts() {
    return this.siteService.getTexts();
  }

  @Post('/texts')
  createText(@Body() createTextDto: CreateTextDto): Promise<Text> {
    return this.siteService.createText(createTextDto);
  }
}
