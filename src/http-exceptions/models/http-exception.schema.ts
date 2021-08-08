import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AppExceptionDocument = AppException & Document;

@Schema({ collection: 'exceptions', timestamps: true })
export class AppException {
  @Prop({
    type: {},
    required: true,
  })
  exception: any;
  // TODO SEGMENTAR OS CAMPOS PARA CONSEGUIR FILTRAR POR QUERY DO MONGODB NO FRONT

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  checked: Date;
}

export const AppExceptionSchema = SchemaFactory.createForClass(AppException);
