import { PaymentStatuses } from '../enums/payment-statuses.enum';
import { PaymentTypeIds } from '../enums/payment-type-ids.enum';

// Types de como vem do Mercado Pago
export class PaymentDTO {
  order: string;            // MP Preference external_reference
  mpId: number;             // Mercado Pago Payment ID
  status: PaymentStatuses;  // Date > updatedAt
  statusDetail: string;
  approvedAt: Date;
  expiresIn: Date;
  moneyReleaseDate: Date;
  paymentTypeId: PaymentTypeIds;
  productsAmount: number;
  shippingAmount: number;
  mercadoPagoFee: number;
  currencyId: string;
}
