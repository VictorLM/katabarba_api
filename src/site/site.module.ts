import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { Text } from './texts/text.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Text])],
  providers: [SiteService],
  controllers: [SiteController],
})
export class SiteModule {}
