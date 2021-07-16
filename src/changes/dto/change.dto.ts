import { Document } from 'mongoose';

export class ChangeDto {
  readonly user: string;
  readonly collectionName: string;
  readonly type: string;
  readonly before: Document;
}
