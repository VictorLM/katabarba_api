import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class MongoIdDTO {
  @IsNotEmpty()
  @IsMongoId({ message: 'ID inválido' })
  readonly id: Types.ObjectId;
}
