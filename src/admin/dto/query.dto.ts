import { IsEnum, IsOptional } from 'class-validator';
import { OrderBy } from '../enum/order-by.enum';

export class QueryDTO {
  @IsOptional()
  @IsEnum(OrderBy, { message: 'Ordernar inválido' })
  readonly orderBy?: OrderBy;
}
