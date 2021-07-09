import { Controller } from '@nestjs/common';
import { TextsService } from '../texts/texts.service';
import { ImagesService } from '../images/images.service';

@Controller('site')
export class SiteController {
  constructor(
    private textsService: TextsService,
    private imagesService: ImagesService,
  ) {}

  //
}
