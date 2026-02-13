import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { IAuthService } from '../services/auth.service.interface';
import { AUTH_SERVICE_TOKEN } from '../../common/constants/auth.constants';
import { LoginDto } from '../dtos/login.dto';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE_TOKEN)
        private readonly authService: IAuthService
    ) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(
            loginDto.name, 
            loginDto.password
        );

        return this.authService.login(user);
    }
}
