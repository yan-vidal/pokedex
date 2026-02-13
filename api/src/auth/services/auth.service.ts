import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUserService } from '../../users/services/user.service.interface';
import { USER_SERVICE_TOKEN } from '../../common/constants/repository.constants';
import { IAuthService } from './auth.service.interface';

@Injectable()
export class AuthService implements IAuthService {
    constructor(
        @Inject(USER_SERVICE_TOKEN)
        private readonly userService: IUserService,
        private readonly jwtService: JwtService
    ) {}

    async validateUser(name: string, pass: string): Promise<any> {
        const user = await this.userService.findByName(name);
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const normalizedPass = pass.toLowerCase();
        const isMatch = await bcrypt.compare(normalizedPass, user.password);
        
        if (!isMatch) {
            throw new UnauthorizedException('Incorrect password');
        }

        const { password, ...result } = (user as any).toObject();
        return result;
    }

    async login(user: any) {
        const payload = { 
            name: user.name, 
            sub: user._id.toString() 
        };
        
        return {
            token: this.jwtService.sign(payload),
            payload: {
                name: user.name,
                id: user._id.toString()
            }
        };
    }
}
