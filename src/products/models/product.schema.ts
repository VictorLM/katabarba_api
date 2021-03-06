import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductAndBoxDimensions } from '../interfaces/product-dimensions.interface';

export type ProductDocument = Product & Document;

@Schema({ collection: 'products', timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  images: string[]; // TODO - ALTERAR EM TODAS AS REFERÊNCIAS

  @Prop({ required: true })
  price: number;

  @Prop({
    required: true,
    type: ProductAndBoxDimensions
  })
  dimensions: ProductAndBoxDimensions; // L x W x H - centemiters

  @Prop({ required: true })
  weight: number; // Kilograms

  @Prop({ required: false, default: null })
  freeShipment: Date;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true })
  available: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
