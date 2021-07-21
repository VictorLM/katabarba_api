import { Controller, Get } from '@nestjs/common';
import { SiteService } from './site.service';
import { CompanyDocument } from './texts/models/company.schema';
// import { CreateTextDto } from './texts/dto/create-text.dto';
import { TextDocument } from './texts/models/text.schema';

@Controller('site')
export class SiteController {
  constructor(private siteService: SiteService) {}

  @Get('/company')
  getMainCompany(): Promise<CompanyDocument> {
    return this.siteService.getMainCompany();
  }

  @Get('/texts')
  getTexts(): Promise<TextDocument[]> {
    return this.siteService.getTexts();
  }

  // @Post('/texts')
  // createText(@Body() createTextDto: CreateTextDto): Promise<Text> {
  //   return this.siteService.createText(createTextDto);
  // }
}
