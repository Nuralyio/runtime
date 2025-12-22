import { singleton } from 'tsyringe';
import prisma from '../../../prisma/prisma';
import { ApplicationMember } from '../models/application-member';
import { ApplicationRole } from '../../application-role/models/application-role';
import { IApplicationMemberRepository } from '../interfaces/application-member.interface';

@singleton()
export class ApplicationMemberRepository implements IApplicationMemberRepository {

  private mapRoleToModel(data: any): ApplicationRole {
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

  private mapToModel(data: any): ApplicationMember {
    const member = new ApplicationMember(
      data.userId,
      data.applicationId,
      data.roleId,
      data.role ? this.mapRoleToModel(data.role) : undefined
    );
    member.id = data.id;
    member.createdAt = data.createdAt;
    member.updatedAt = data.updatedAt;
    return member;
  }

  async findById(id: number): Promise<ApplicationMember | null> {
    const data = await prisma.applicationMember.findUnique({
      where: { id },
      include: { role: true },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findByUserAndApplication(userId: string, applicationId: string): Promise<ApplicationMember | null> {
    const data = await prisma.applicationMember.findUnique({
      where: {
        userId_applicationId: { userId, applicationId },
      },
      include: { role: true },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findByApplicationId(applicationId: string): Promise<ApplicationMember[]> {
    const data = await prisma.applicationMember.findMany({
      where: { applicationId },
      include: { role: true },
      orderBy: { createdAt: 'asc' },
    });
    return data.map(d => this.mapToModel(d));
  }

  async findApplicationsForUser(userId: string): Promise<string[]> {
    const data = await prisma.applicationMember.findMany({
      where: { userId },
      select: { applicationId: true },
    });
    return data.map(d => d.applicationId);
  }

  /**
   * Get applications where user has a specific permission via their role
   */
  async findApplicationsWithPermission(userId: string, permission: string): Promise<string[]> {
    // Get all memberships with roles
    const memberships = await prisma.applicationMember.findMany({
      where: { userId },
      include: { role: true },
    });

    // Filter by permission
    const result: string[] = [];
    for (const m of memberships) {
      const permissions = m.role.permissions as string[];

      // Check wildcard
      if (permissions.includes('*')) {
        result.push(m.applicationId);
        continue;
      }

      // Check exact match
      if (permissions.includes(permission)) {
        result.push(m.applicationId);
        continue;
      }

      // Check resource wildcard (e.g., "page:*" matches "page:read")
      const [resource] = permission.split(':');
      if (permissions.includes(`${resource}:*`)) {
        result.push(m.applicationId);
      }
    }

    return result;
  }

  async create(member: ApplicationMember): Promise<ApplicationMember> {
    const data = await prisma.applicationMember.create({
      data: {
        userId: member.userId,
        applicationId: member.applicationId,
        roleId: member.roleId,
      },
      include: { role: true },
    });
    return this.mapToModel(data);
  }

  async update(id: number, roleId: number): Promise<ApplicationMember> {
    const data = await prisma.applicationMember.update({
      where: { id },
      data: { roleId },
      include: { role: true },
    });
    return this.mapToModel(data);
  }

  async delete(id: number): Promise<ApplicationMember> {
    const data = await prisma.applicationMember.delete({
      where: { id },
      include: { role: true },
    });
    return this.mapToModel(data);
  }

  async deleteByUserAndApplication(userId: string, applicationId: string): Promise<ApplicationMember> {
    const data = await prisma.applicationMember.delete({
      where: {
        userId_applicationId: { userId, applicationId },
      },
      include: { role: true },
    });
    return this.mapToModel(data);
  }

  /**
   * Count owners for an application (used to prevent removing last owner)
   */
  async countOwners(applicationId: string): Promise<number> {
    const count = await prisma.applicationMember.count({
      where: {
        applicationId,
        role: {
          name: 'owner',
        },
      },
    });
    return count;
  }
}
