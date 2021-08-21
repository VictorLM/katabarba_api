import { IsDate, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { PasswordResetTokenDocument } from '../../auth/models/password-reset-token.schema';
import { AppErrorDocument } from '../../errors/models/app-error.schema';
import { OrderDocument } from '../../orders/models/order.schema';
import { User, UserDocument } from '../../users/models/user.schema';
import { EmailTypes } from '../enums/email-types.enum';
import { EmailRecipient } from '../interfaces/email-recipient.interface.';
import { EmailDocument } from '../models/email.schema';
import { ProductAvailableNotification } from '../models/product-available-notification.schema';

export class CreateEmailDTO {
  readonly recipients: EmailRecipient[];
  readonly type: EmailTypes;
  readonly relatedTo?: Types.ObjectId;
}

// TODO - CLASS VALIDATOR DATE || NULL
export class UpdateEmailDTO {
  @IsNotEmpty({ message: 'Campo Reenviar é obrigatório' })
  @IsDate({ message: 'Campo Reenviar deve ser uma data válida' })
  readonly notResend: Date;
}

/**
 * document
 * @param {OrderDocument} document - EmailTypes: ORDER_CREATE, ORDER_PAYED, ORDER_SHIPPED, ORDER_PAYMENT_REMINDER
 * @param {OrderDocument[]} document - EmailTypes: VALUE_CONFLICT
 * @param {ProductAvailableNotification} document - EmailTypes: PRODUCT_AVAILABLE
 * @param {AppErrorDocument[]} document - EmailTypes: NEW_ERRORS
 * @param {PasswordResetTokenDocument} document - EmailTypes: USER_PASSWORD_RESET
 * type
 * @param {EmailTypes} type - Enum EmailTypes
 * recipients
 * @param {string} recipients - EmailTypes: PRODUCT_AVAILABLE
 * @param {others} recipients - EmailTypes: Todos os outros EmailTypes
 * relatedTo
 * @param {Types.ObjectId | null} relatedTo - ID do documento relacionado, caso haja (Order, Product)
*/
class DocumentToEmail {
  readonly document: OrderDocument | OrderDocument[] | ProductAvailableNotification | AppErrorDocument[] | PasswordResetTokenDocument;
}

export class SendEmailDTO extends DocumentToEmail {
  readonly type: EmailTypes;
  readonly recipients: UserDocument | UserDocument[] | User | User[] | string;
  readonly relatedTo: Types.ObjectId | null;
}

export class ResendEmailDTO extends DocumentToEmail {
  readonly email: EmailDocument;
}
