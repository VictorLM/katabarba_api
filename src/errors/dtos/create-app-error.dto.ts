import { Types } from 'mongoose';

export class CreateAppErrorDTO {
  readonly user?: Types.ObjectId;
  readonly action: string;
  readonly error: unknown;
  readonly model?: any;
}
