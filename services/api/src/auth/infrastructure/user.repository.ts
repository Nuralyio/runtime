import prisma from '../../../prisma/prisma';
import { IUserRepository } from '../domain/interfaces/user.interface';
import { User } from '../domain/user';

export class UserRepositoryPrismaPgSQL implements IUserRepository {

  public async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password
      }
    });
    return new User(createdUser.name, createdUser.email, createdUser.password, createdUser.id);
  }

  public async findAll(): Promise<User[] | null> {
    const users = await prisma.user.findMany();
    return users ? users.map(user => new User(user.name, user.email, "not-show", user.id)) : null;
  }

  public async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id },
    });
    return user ? new User(user.name, user.email, "not-show", user.id) : null;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    return user ? new User(user.name, user.email, "not-show", user.id) : null;
  }

  public async findUserByEmailWithPassword(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true
      }
    });
    return user ? new User(user.name, user.email, user.password, user.id) : null;
  }

  public async update(id: string, user: User): Promise<User> {
    const userUpdate = await prisma.user.update({
      where: { id },
      data: {
        name: user.name,
        email: user.email
      }
    });
    return new User(userUpdate.name, userUpdate.email, "not-show", userUpdate.id);
  }

  public async delete(id: string): Promise<string> {
    await prisma.user.delete({
      where: { id }
    });
    return "User deleted successfully";
  }
}
