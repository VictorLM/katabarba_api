import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorsModule } from '../errors/errors.module';
import { ChangesService } from './changes.service';
import { Change, ChangeSchema } from './models/change.schema';

@Module({
  imports: [
    ErrorsModule,
    MongooseModule.forFeature([
      { name: Change.name, schema: ChangeSchema },
    ]),
  ],
  controllers: [],
  providers: [ChangesService],
  exports: [ChangesService],
})
export class ChangesModule {}
