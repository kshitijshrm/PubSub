import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString({ message: 'The "user" field must be a string.' })
    @IsNotEmpty({ message: 'The "user" field is required.' })
    user: string;

    @IsString({ message: 'The "class" field must be a string.' })
    @IsNotEmpty({ message: 'The "class" field is required.' })
    class: string;

    @IsInt({ message: 'The "age" field must be an integer.' })
    age: number;

    @IsEmail({}, { message: 'The "email" field must be a valid email address.' })
    email: string;
}