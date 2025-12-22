import { handleError } from '../../exceptions/handle.error';
import { IUserRepository, KeycloakUserInfo } from '../domain/interfaces/user.interface';
import { User } from '../domain/user';
import { Logger } from 'tslog';
import {NotFoundException} from "../../exceptions/NotFoundException";

const logger = new Logger();

export class UserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    public async create(keycloakId: string, name: string, email: string): Promise<User> {
        try {
            const user: User = new User(keycloakId, name, email);
            return await this.userRepository.create(user);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findAll(): Promise<User[]> {
        try {
            const users = await this.userRepository.findAll();
            if (!users) {
                throw new NotFoundException('Users not found');
            }
            return users;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findById(id: string): Promise<User> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException(`User with id ${id} not found.`);
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findByKeycloakId(keycloakId: string): Promise<User> {
        try {
            const user = await this.userRepository.findByKeycloakId(keycloakId);
            if (!user) {
                throw new NotFoundException(`User with keycloakId ${keycloakId} not found.`);
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async findUserByEmail(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findUserByEmail(email);
            if (!user) {
                throw new NotFoundException(`User with email ${email} not found.`);
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    /**
     * JIT (Just-In-Time) provisioning: Find or create user from Keycloak info
     */
    public async findOrCreateFromKeycloak(keycloakUser: KeycloakUserInfo): Promise<User> {
        try {
            return await this.userRepository.findOrCreateFromKeycloak(keycloakUser);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async update(id: string, name: string, email: string): Promise<User> {
        try {
            const findUser = await this.findById(id);
            const user = new User(findUser.keycloakId, name, email, id);
            return await this.userRepository.update(id, user);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async delete(id: string): Promise<string> {
        try {
            await this.findById(id);
            return await this.userRepository.delete(id);
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }
}
