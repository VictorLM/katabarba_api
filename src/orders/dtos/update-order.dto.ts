import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UpdateOrderStatuses } from '../enums/order-statuses.enum';

export class UpdateOrderDTO {
  @IsNotEmpty({ message: 'Status é obrigatório' })
  @IsEnum(UpdateOrderStatuses, { message: 'Status inválido' })
  readonly status: UpdateOrderStatuses;

  @IsOptional()
  @IsString({ message: 'Código de rastreamento inválido' })
  readonly trackingCode?: string;
}
