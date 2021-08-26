import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAppErrorDTO } from './dtos/create-app-error.dto';
import { UpdateAppErrorDTO } from './dtos/update-app-error.dto';
import { AppError, AppErrorDocument } from './models/app-error.schema';

@Injectable()
export class ErrorsService {
  constructor(
    @InjectModel(AppError.name) private errorsModel: Model<AppErrorDocument>,
  ) {}

  async getAppErrorById(id: Types.ObjectId): Promise<AppErrorDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID de Erro "${id}" inválido`);
    }
    const found = await this.errorsModel.findById(id);
    if (!found) {
      throw new NotFoundException(`Erro com ID "${id}" não encontrado`);
    }
    return found;
  }

  async getNotCheckedAppErrors(): Promise<AppErrorDocument[]> {
    return await this.errorsModel.find({ checked: null });
  }

  async createAppError(createAppErrorDTO: CreateAppErrorDTO): Promise<void> {
    const newAppError = new this.errorsModel(createAppErrorDTO);
    // Se der erro nesse try, lascou
    try {
      await newAppError.save();
    } catch (error) {
      console.log(error);
    }
  }

  async updateAppError(
    updateAppErrorDTO: UpdateAppErrorDTO,
  ): Promise<void> {
    const foundAppError = await this.getAppErrorById(updateAppErrorDTO.errorId);
    if(!foundAppError.checked){
      foundAppError.checked = updateAppErrorDTO.checked && new Date();
    }
    foundAppError.notes = updateAppErrorDTO.notes;
    try {
      await foundAppError.save();
    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.createAppError({
        action: 'ErrorsService.updateAppError',
        error,
        model: foundAppError,
      });
      throw new InternalServerErrorException('Erro ao atualizar o Erro');
    }
  }

}
