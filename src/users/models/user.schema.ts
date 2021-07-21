import { Prop, Schema, SchemaFactory,  } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../auth/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  cpf: number;

  @Prop()
  phone: number;

  @Prop({ required: true, default: [Role.CUSTOMER] })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
