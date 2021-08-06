import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './models/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companiesModel: Model<CompanyDocument>,
  ) {}

  async getMainCompany(): Promise<CompanyDocument> {
    const found = await this.companiesModel.findOne(
      {
        main: { $ne: null },
        inactive: null,
      }
    ).populate('address');

    if (!found) {
      throw new NotFoundException('Empresa Principal não encontrada');
    }
    return found;
  }

  async getAllCompanies(): Promise<CompanyDocument[]> {
    const found = await this.companiesModel.find(
      { inactive: null }
    ).populate('address');

    if (!found) {
      throw new NotFoundException('Nenhuma Empresa ativa encontrada');
    }
    return found;
  }

  async getShiptCompanyZipCode(): Promise<string> {
    const found = await this.companiesModel.findOne(
      {
        isShippingOrigin: { $ne: null },
        inactive: null,
      }
    ).populate('address', 'zipCode');

    if (!found) {
      throw new NotFoundException('Empresa de Remessa não encontrada');
    }
    return found.address.zipCode;
  }

  async getShiptCompanyAddress(): Promise<any> { // TODO ANY TYPE
    const found = await this.companiesModel.findOne(
      {
        isShippingOrigin: { $ne: null },
        inactive: null,
      }
    ).populate('address');

    if (!found) {
      throw new NotFoundException('Empresa de Remessa não encontrada');
    }
    return found.address;
  }

}
