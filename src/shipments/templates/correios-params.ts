import { AxiosRequestConfig } from 'axios';
import { OrderBoxDimensions } from '../../orders/interfaces/order-dimensions.interface';

// https://www.correios.com.br/atendimento/ferramentas/sistemas/arquivos/manual-de-implementacao-do-calculo-remoto-de-precos-e-prazos

export enum CorreiosServiceCodes {
  PAC = '04510',
  SEDEX = '04014',
}

export class CorreiosParams {
  nCdEmpresa: string; // Código administrativo junto à ECT
  sDsSenha: string; // Senha para acesso ao serviço
  nCdServico: CorreiosServiceCodes;
  sCepOrigem: string; // Somente números, sem hífen // TODO - VALIDAR
  sCepDestino: string; // Somente números, sem hífen // TODO - VALIDAR
  nVlPeso: string; // Em Kg
  nCdFormato: number; // 1 = Caixa/pacote, 2 = Rolo/prisma, 3 = Envelope
  nVlComprimento: number; // Em Cm
  nVlAltura: number; // Em Cm
  nVlLargura: number; // Em Cm
  nVlDiametro: number; // Em Cm
  sCdMaoPropria: string; // S = Sim,  N = Não
  nVlValorDeclarado: number; // 0 = Não optar pelo serviço
  sCdAvisoRecebimento: string; // S = Sim,  N = Não
  // StrRetorno: string; // xml

  constructor(
    serviceCode: CorreiosServiceCodes,
    originZipCode: string,
    deliveryZipCode: string,
    dimensions: OrderBoxDimensions,
    weight: string,
  ) {
    this.nCdEmpresa = '';
    this.sDsSenha = '';
    this.nCdServico = serviceCode;
    this.sCepOrigem = originZipCode;
    this.sCepDestino = deliveryZipCode;
    this.nVlPeso = weight;
    this.nCdFormato = 1;
    this.nVlComprimento = dimensions.length;
    this.nVlAltura = dimensions.height;
    this.nVlLargura = dimensions.width;
    this.nVlDiametro = 0;
    this.sCdMaoPropria = 'N';
    this.nVlValorDeclarado = 0;
    this.sCdAvisoRecebimento = 'N';
    // this.StrRetorno = 'xml';
  }
}

export const correiosWebServiceUrl = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo';

export const axiosCorreiosConfig: AxiosRequestConfig = {
  responseType: 'text',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
};
