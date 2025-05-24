import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false })
export class UserProcessed extends Document {
  @Prop({ required: true, unique: true })
  declare id: string;

  @Prop()
  user: string;

  @Prop()
  class: string;

  @Prop()
  age: number;

  @Prop()
  email: string;

  @Prop()
  inserted_at: Date;

  @Prop()
  modified_at: Date;
}

export const UserProcessedSchema = SchemaFactory.createForClass(UserProcessed);
