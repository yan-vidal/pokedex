export interface IAuthService {
    validateUser(name: string, pass: string): Promise<any>;
    login(user: any): Promise<{ token: string; payload: any }>;
}
