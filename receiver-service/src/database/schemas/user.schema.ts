import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema()
export class User extends Document {
  @Prop({ default: () => uuidv4() })
  declare id: string;

  @Prop()
  user: string;

  @Prop()
  class: string;

  @Prop()
  age: number;

  @Prop()
  email: string;

  @Prop({ default: () => new Date() })
  inserted_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);