import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateAppErrorDTO {
  @IsNotEmpty()
  @IsMongoId()
  readonly errorId: Types.ObjectId;

  @IsOptional()
  @IsBoolean()
  readonly checked: boolean;

  @IsOptional()
  @IsString()
  readonly notes: string;
}
