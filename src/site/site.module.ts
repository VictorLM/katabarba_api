import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { Text, TextSchema } from './texts/text.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Text.name, schema: TextSchema },
  ]),],
  providers: [SiteService],
  controllers: [SiteController],
})
export class SiteModule {}
