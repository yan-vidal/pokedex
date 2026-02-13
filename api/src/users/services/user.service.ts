import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../repositories/user.repository.interface';
import { USER_REPOSITORY_TOKEN } from '../../common/constants/repository.constants';
import { IUser } from '../schemas/user.schema';
import { IUserService } from './user.service.interface';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(USER_REPOSITORY_TOKEN)
        private readonly userRepository: IUserRepository
    ) {}

    private normalize(value: string): string {
        return value.toLowerCase();
    }

    async create(name: string, password: string): Promise<IUser> {
        const normalizedName = this.normalize(name);
        const normalizedPassword = this.normalize(password);
        
        const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
        
        return await this.userRepository.create({
            name: normalizedName,
            password: hashedPassword
        });
    }

    async findByName(name: string): Promise<IUser | null> {
        return await this.userRepository.findByName(this.normalize(name));
    }

    async findById(id: string): Promise<IUser | null> {
        return await this.userRepository.findById(id);
    }
}
