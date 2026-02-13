import { IUser } from '../schemas/user.schema';

export interface IUserRepository {
    create(user: Partial<IUser>): Promise<IUser>;
    findByName(name: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
}
