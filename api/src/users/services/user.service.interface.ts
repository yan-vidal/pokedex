import { IUser } from '../schemas/user.schema';

export interface IUserService {
    create(name: string, password: string): Promise<IUser>;
    findByName(name: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
}
