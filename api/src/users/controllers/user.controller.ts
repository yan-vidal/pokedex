import { Controller, Post, Body, Inject } from '@nestjs/common';
import { IUserService } from '../services/user.service.interface';
import { USER_SERVICE_TOKEN } from '../../common/constants/repository.constants';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('users')
export class UserController {
    constructor(
        @Inject(USER_SERVICE_TOKEN)
        private readonly userService: IUserService
    ) {}

    @Public()
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.userService.create(
            createUserDto.name,
            createUserDto.password
        );
        
        const { password, ...result } = (user as any).toObject();
        return result;
    }
}
