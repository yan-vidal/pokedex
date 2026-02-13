import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string = '';

    @IsString()
    @MinLength(4)
    password: string = '';
}
