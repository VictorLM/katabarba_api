import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { Company, CompanySchema } from './texts/models/company.schema';
import { Text, TextSchema } from './texts/models/text.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Text.name, schema: TextSchema },
    { name: Company.name, schema: CompanySchema },
  ]),],
  providers: [SiteService],
  controllers: [SiteController],
  exports: [SiteService]
})
export class SiteModule {}
