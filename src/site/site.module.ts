import { Module } from '@nestjs/common';
import { TextsService } from '../texts/texts.service';
import { ImagesService } from '../images/images.service';
import { SiteController } from './site.controller';

@Module({
  controllers: [SiteController],
  providers: [TextsService, ImagesService],
})
export class SiteModule {}
