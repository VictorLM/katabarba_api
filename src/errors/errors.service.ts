import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppErrorUpdateDTO } from './dtos/app-error-update.dto';
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

  // TODO - Notification e-mail
  async createAppError(
    userId: Types.ObjectId | null,
    action: string,
    error: Error,
    model: any, // TODO?
  ): Promise<void> {
    const newAppError = new this.errorsModel({
      user: userId,
      action,
      error,
      model,
    });
    // Se der erro nesse try, lascou
    try {
      await newAppError.save();
    } catch (error) {
      console.log(error);
    }
  }

  async updateAppError(
    appErrorUpdateDTO: AppErrorUpdateDTO,
  ): Promise<void> {
    const foundAppError = await this.getAppErrorById(appErrorUpdateDTO.errorId);
    if(!foundAppError.checked){
      foundAppError.checked = appErrorUpdateDTO.checked && new Date();
    }
    foundAppError.notes = appErrorUpdateDTO.notes;
    try {
      await foundAppError.save();
    } catch (error) {
      console.log(error);
      // Log error into DB - not await
      this.createAppError(
        null,
        'updateAppError',
        error,
        foundAppError,
      );
      throw new InternalServerErrorException('Erro ao atualizar o Erro');
    }
  }

}
