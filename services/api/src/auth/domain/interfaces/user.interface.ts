import { User } from "../user";

export interface IUserRepository{
    create(user: User): Promise<User>;
    findAll(): Promise<User[] | null>;
    findById(id: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByEmailWithPassword(email: string): Promise<User | null>;
    update(id: string, user: User): Promise<User>;
    delete(id: string): Promise<string>;
}