import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';
import { UserMongooseRepository } from './repositories/mongoose/user.mongoose.repository';
import { USER_REPOSITORY_TOKEN, USER_SERVICE_TOKEN } from '../common/constants/repository.constants';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])
    ],
    controllers: [UserController],
    providers: [
        UserService,
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: UserMongooseRepository,
        },
        {
            provide: USER_SERVICE_TOKEN,
            useClass: UserService,
        }
    ],
    exports: [USER_SERVICE_TOKEN]
})
export class UsersModule {}
