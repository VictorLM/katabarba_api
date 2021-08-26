import { IsEmail, IsEnum, IsOptional, Matches } from 'class-validator';
import { QueryDTO } from '../../admin/dto/query.dto';
import { OrderStatuses } from '../enums/order-statuses.enum';

export class OrderQueryDTO extends QueryDTO {
  @IsOptional()
  @IsEnum(OrderStatuses, { message: 'Status inválido' })
  readonly orderStatus?: OrderStatuses;

  @IsOptional()
  @Matches(/^\d{4}(-)(((0)[0-9])|((1)[0-2]))(-)([0-2][0-9]|(3)[0-1])$/i, {
    message: "Data inválida."
  })
  readonly orderDate?: string; // Query params sempre vem como string

  @IsOptional()
  @IsEmail({}, { message: 'Email do cliente inválido' })
  readonly customerEmail?: string;
}
