import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser, IUserDocument } from '../../schemas/user.schema';
import { IUserRepository } from '../user.repository.interface';

@Injectable()
export class UserMongooseRepository implements IUserRepository {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUserDocument>
    ) {}

    async create(user: Partial<IUser>): Promise<IUser> {
        const newUser = new this.userModel(user);
        return await newUser.save();
    }

    async findByName(name: string): Promise<IUser | null> {
        return await this.userModel.findOne({ name }).exec();
    }

    async findById(id: string): Promise<IUser | null> {
        return await this.userModel.findById(id).exec();
    }
}
