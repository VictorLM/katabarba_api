import { Types } from "mongoose";

enum PaymentStatus {
  AWAITING = 'AWAITING',
  PAYED = 'PAYED',
  CANCELED = 'CANCELED',
}

export class Payment {
  id: Types.ObjectId;
  status: PaymentStatus;
  statusDate: Date;
  method: string;
  createdAt: Date;
}
