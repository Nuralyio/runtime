import { singleton } from 'tsyringe';
import prisma from '../../../prisma/prisma';
import { ApplicationRole } from '../models/application-role';
import { IApplicationRoleRepository } from '../interfaces/application-role.interface';

@singleton()
export class ApplicationRoleRepository implements IApplicationRoleRepository {

  private mapToModel(data: any): ApplicationRole {
    const role = new ApplicationRole(
      data.name,
      data.displayName,
      data.permissions as string[],
      data.hierarchy,
      data.applicationId,
      data.description,
      data.isSystem
    );
    role.id = data.id;
    role.createdAt = data.createdAt;
    return role;
  }

  async findById(id: number): Promise<ApplicationRole | null> {
    const data = await prisma.applicationRole.findUnique({
      where: { id },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findByName(applicationId: string | null, name: string): Promise<ApplicationRole | null> {
    const data = await prisma.applicationRole.findFirst({
      where: {
        applicationId,
        name,
      },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findSystemRoles(): Promise<ApplicationRole[]> {
    const data = await prisma.applicationRole.findMany({
      where: { isSystem: true },
      orderBy: { hierarchy: 'desc' },
    });
    return data.map(this.mapToModel);
  }

  async findByApplicationId(applicationId: string): Promise<ApplicationRole[]> {
    // Return both system roles AND application-specific custom roles
    const data = await prisma.applicationRole.findMany({
      where: {
        OR: [
          { isSystem: true },
          { applicationId },
        ],
      },
      orderBy: { hierarchy: 'desc' },
    });
    return data.map(this.mapToModel);
  }

  async create(role: ApplicationRole): Promise<ApplicationRole> {
    const data = await prisma.applicationRole.create({
      data: {
        applicationId: role.applicationId,
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        isSystem: role.isSystem,
        hierarchy: role.hierarchy,
      },
    });
    return this.mapToModel(data);
  }

  async update(id: number, role: Partial<ApplicationRole>): Promise<ApplicationRole> {
    const data = await prisma.applicationRole.update({
      where: { id },
      data: {
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        hierarchy: role.hierarchy,
      },
    });
    return this.mapToModel(data);
  }

  async delete(id: number): Promise<ApplicationRole> {
    const data = await prisma.applicationRole.delete({
      where: { id },
    });
    return this.mapToModel(data);
  }
}
