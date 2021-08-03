import { Type } from 'class-transformer';
import { Equals, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PaymentNotificationActions } from '../enums/payment-notification-actions.enum';

class Data {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class PaymentNotificationDTO {
  @IsNotEmpty()
  @Equals('payment')
  readonly type: 'payment';

  @IsNotEmpty()
  @IsEnum(PaymentNotificationActions)
  readonly action: PaymentNotificationActions;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Data)
  readonly data;
}
