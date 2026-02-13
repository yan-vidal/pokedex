import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AUTH_SERVICE_TOKEN } from '../common/constants/auth.constants';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'temporary-secret-key',
                signOptions: { expiresIn: '15d' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: AUTH_SERVICE_TOKEN,
            useClass: AuthService,
        },
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
    exports: [AUTH_SERVICE_TOKEN],
})
export class AuthModule {}
