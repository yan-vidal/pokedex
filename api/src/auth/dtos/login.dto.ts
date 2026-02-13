import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString()
    name: string = '';

    @IsString()
    @MinLength(4)
    password: string = '';
}
