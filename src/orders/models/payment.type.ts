enum PaymentStatus {
  AWAITING = 'AWAITING',
  PAYED = 'PAYED',
  CANCELED = 'CANCELED',
}

export class Payment {
  id: string;
  status: PaymentStatus;
  statusDate: Date;
  method: string;
  createdAt: Date;
}
