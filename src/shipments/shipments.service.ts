import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompaniesService } from '../companies/companies.service';
import { PublicGetShipmentCostsDTO } from './dtos/shipment.dto';
import { Shipment, ShipmentDocument } from './models/shipment.schema';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment.name) private shipmentsModel: Model<ShipmentDocument>,
    private companiesService: CompaniesService,
    private httpService: HttpService,
  ) {}

  async publicGetShipmentCosts(
    publicGetShipmentCostsDTO: PublicGetShipmentCostsDTO
  ): Promise<any> {
    const { deliveryZipCode, products } = publicGetShipmentCostsDTO;
    // console.log('ZIPAO: ', deliveryZipCode);
    // console.log('PRODUCTOES: ', JSON.stringify(products));
    const test = await this.companiesService.getShiptCompanyZipCode();

    const url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo';
    const params = {
      nCdEmpresa: '',
      sDsSenha: '',
      nCdServico: '04014',
      sCepOrigem: '05311900',
      sCepDestino: '13026064',
      nVlPeso: '1',
      nCdFormato: 3,
      nVlComprimento: 25,
      nVlAltura: 10,
      nVlLargura: 20,
      nVlDiametro: 30,
      sCdMaoPropria: 'N',
      nVlValorDeclarado: 0,
      sCdAvisoRecebimento: 'N',
    };

    const url2 = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?nCdEmpresa=08082650&sDsSenha=564321&sCepOrigem=70002900&sCepDestino=04547000&nVlPeso=1&nCdFormato=1&nVlComprimento=20&nVlAltura=20&nVlLargura=20&sCdMaoPropria=n&nVlValorDeclarado=0&sCdAvisoRecebimento=n&nCdServico=04510&nVlDiametro=0&StrRetorno=xml&nIndicaCalculo=3';

    try {
      const response = this.httpService.get(url2,
        {
          responseType: 'text',
          // params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Content-Length': 'length',
          }
        }
      );
      console.log(response);
      return response;

    } catch (error) {
      console.error(error);
    }

  }

}
