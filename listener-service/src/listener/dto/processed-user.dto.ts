import { IsDateString, IsEmail, IsInt, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ProcessedUserDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  class: string;

  @IsInt()
  age: number;

  @IsEmail()
  email: string;

  @IsDateString()
  inserted_at: string;

  @IsDateString()
  modified_at: string;
}
