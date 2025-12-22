import prisma from '../../../prisma/prisma';
import { IUserRepository, KeycloakUserInfo } from '../domain/interfaces/user.interface';
import { User } from '../domain/user';

export class UserRepositoryPrismaPgSQL implements IUserRepository {

  public async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        keycloakId: user.keycloakId,
        name: user.name,
        email: user.email,
      }
    });
    return new User(createdUser.keycloakId, createdUser.name, createdUser.email, createdUser.id);
  }

  public async findAll(): Promise<User[] | null> {
    const users = await prisma.user.findMany();
    return users ? users.map(user => new User(user.keycloakId, user.name, user.email, user.id)) : null;
  }

  public async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { id },
    });
    return user ? new User(user.keycloakId, user.name, user.email, user.id) : null;
  }

  public async findByKeycloakId(keycloakId: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { keycloakId },
    });
    return user ? new User(user.keycloakId, user.name, user.email, user.id) : null;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    return user ? new User(user.keycloakId, user.name, user.email, user.id) : null;
  }

  /**
   * Find or create a user from Keycloak info (JIT provisioning)
   * First tries to find by keycloakId, then by email (for migration), then creates new
   */
  public async findOrCreateFromKeycloak(keycloakUser: KeycloakUserInfo): Promise<User> {
    // First, try to find by keycloakId
    let user = await prisma.user.findUnique({
      where: { keycloakId: keycloakUser.uuid },
    });

    if (user) {
      // Update email/name if changed in Keycloak
      if (user.email !== keycloakUser.email || user.name !== (keycloakUser.name || keycloakUser.username)) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            email: keycloakUser.email,
            name: keycloakUser.name || keycloakUser.username,
          }
        });
      }
      return new User(user.keycloakId, user.name, user.email, user.id);
    }

    // Try to find by email (for users that existed before JIT)
    const existingByEmail = await prisma.user.findUnique({
      where: { email: keycloakUser.email },
    });

    if (existingByEmail) {
      // Link existing user to Keycloak
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          keycloakId: keycloakUser.uuid,
          name: keycloakUser.name || keycloakUser.username,
        }
      });
      return new User(user.keycloakId, user.name, user.email, user.id);
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        keycloakId: keycloakUser.uuid,
        name: keycloakUser.name || keycloakUser.username,
        email: keycloakUser.email,
      }
    });

    return new User(user.keycloakId, user.name, user.email, user.id);
  }

  public async update(id: string, user: User): Promise<User> {
    const userUpdate = await prisma.user.update({
      where: { id },
      data: {
        name: user.name,
        email: user.email
      }
    });
    return new User(userUpdate.keycloakId, userUpdate.name, userUpdate.email, userUpdate.id);
  }

  public async delete(id: string): Promise<string> {
    await prisma.user.delete({
      where: { id }
    });
    return "User deleted successfully";
  }
}
