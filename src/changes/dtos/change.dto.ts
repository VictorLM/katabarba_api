import { Document, Types } from 'mongoose';

export class ChangeDto {
  readonly user: Types.ObjectId;
  readonly collectionName: string;
  readonly type: string;
  readonly before: Document;
}
