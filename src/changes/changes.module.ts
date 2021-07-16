import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChangesService } from './changes.service';
import { Change, ChangeSchema } from './models/change.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Change.name, schema: ChangeSchema },
    ]),
  ],
  controllers: [],
  providers: [ChangesService],
  exports: [ChangesService],
})
export class ChangesModule {}
