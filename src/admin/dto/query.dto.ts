import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderBy } from '../enum/order-by.enum';

export class QueryDTO {
  @IsOptional()
  @IsEnum(OrderBy, { message: 'Ordernar inválido' })
  readonly orderBy?: OrderBy;

  @IsOptional()
  @IsString({ message: 'Página inválida' }) // Query params sempre vem como string
  readonly page?: string;

  @IsOptional()
  @IsString({ message: 'Limite inválido' }) // Query params sempre vem como string
  readonly limit?: string;
}
