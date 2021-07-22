import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUrl,
  ValidateNested,
  IsBoolean
} from 'class-validator';

export class CompanySocialLinks {
  @IsOptional()
  @IsUrl({}, { message: 'Facebook deve ser uma URL válida' })
  readonly facebook: string;

  @IsOptional()
  @IsUrl({}, { message: 'Instagram deve ser uma URL válida' })
  readonly instagram: string;

  @IsOptional()
  @IsUrl({}, { message: 'Twitter deve ser uma URL válida' })
  readonly twitter: string;

  @IsOptional()
  @IsUrl({}, { message: 'Youtube deve ser uma URL válida' })
  readonly youtube: string;

  @IsOptional()
  @IsUrl({}, { message: 'LinkedIn deve ser uma URL válida' })
  readonly linkedin: string;
}

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve conter apenas caracteres comuns' })
  readonly name: string;

  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @IsString({ message: 'CNPJ deve conter apenas caracteres comuns' })
  readonly cnpj: string;
  readonly phone: string;
  readonly mobile: string;
  readonly email: string;
  readonly logo: string;

  @IsOptional()
  @IsBoolean({ message: 'Origem de Remessa inválida' }) // TODO - DATE AO CRIAR
  readonly isShippingOrigin: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Empresa Principal inválida' }) // TODO - DATE AO CRIAR
  readonly main: boolean;

  @IsOptional()
  @IsBoolean({ message: 'Inativo inválido' }) // TODO - DATE AO CRIAR
  readonly inactive: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CompanySocialLinks)
  readonly social: CompanySocialLinks;

}
