import { Types } from 'mongoose';

export class CreateChangeDTO {
  readonly collectionName: string;
  readonly type: string;
  readonly beforeDoc: any; // Tem que ser uma deep copy de um Mongoose Document com spread operator { ...document }
  readonly user: Types.ObjectId;
}
