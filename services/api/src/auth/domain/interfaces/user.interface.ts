import { User } from "../user";

export interface KeycloakUserInfo {
    uuid: string;      // Keycloak sub (user ID)
    username: string;
    email: string;
    name?: string;     // Full name or username fallback
}

export interface IUserRepository{
    create(user: User): Promise<User>;
    findAll(): Promise<User[] | null>;
    findById(id: string): Promise<User | null>;
    findByKeycloakId(keycloakId: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findOrCreateFromKeycloak(keycloakUser: KeycloakUserInfo): Promise<User>;
    update(id: string, user: User): Promise<User>;
    delete(id: string): Promise<string>;
}