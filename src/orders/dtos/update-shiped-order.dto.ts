import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateShipedOrderDTO {
  @IsNotEmpty()
  @IsString({ message: 'Código de rastreamento inválido' })
  readonly trackingCode: string;
}
