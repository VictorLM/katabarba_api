import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from '../../products/models/product.schema';
import { Email } from './email.schema';

export type ProductAvailableNotificationDocument = ProductAvailableNotification & mongoose.Document;

@Schema({ collection: 'productAvailableNotifications', timestamps: true })
export class ProductAvailableNotification {
  @Prop({ required: true })
  recipient: string; // email

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product: Product;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email',
    required: false,
    default: null,
  })
  email: Email;
}

export const ProductAvailableNotificationSchema = SchemaFactory.createForClass(ProductAvailableNotification);
