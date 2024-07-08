import { NotFoundException } from '../../common/exceptions';
import { handleError } from '../../common/handle.error';
import { IUserRepository } from '../domain/interfaces/user.interface';
import { User } from '../domain/user';
import bcrypt from 'bcrypt';
import { Logger } from 'tslog';

const logger = new Logger();

export class UserService {
    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    public async create(name: string, email: string, password: string): Promise<User> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user: User = new User(name, email, hashedPassword);
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
                throw new NotFoundException('Users not founds');
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

    public async findUserByEmailWithPassword(email: string): Promise<User> {
        try {
            const user = await this.userRepository.findUserByEmailWithPassword(email);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            handleError(error, logger);
            throw error;
        }
    }

    public async update(id: string, name: string, email: string): Promise<User> {
        try {
            const findUser = await this.findById(id);
            const user = new User(name, email, findUser!.password);
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
