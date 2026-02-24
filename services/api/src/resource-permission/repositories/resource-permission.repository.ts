import { singleton } from 'tsyringe';
import prisma from '../../../prisma/prisma';
import { ResourcePermission, GranteeType, PermissionType } from '../models/resource-permission';
import { IResourcePermissionRepository } from '../interfaces/resource-permission.interface';

@singleton()
export class ResourcePermissionRepository implements IResourcePermissionRepository {

  private mapToModel(data: any): ResourcePermission {
    const permission = new ResourcePermission(
      data.resourceId,
      data.resourceType,
      data.granteeType as GranteeType,
      data.permission as PermissionType,
      data.grantedBy,
      data.granteeId,
      data.expiresAt
    );
    permission.id = data.id;
    permission.createdAt = data.createdAt;
    return permission;
  }

  async findById(id: number): Promise<ResourcePermission | null> {
    const data = await prisma.resourcePermission.findUnique({
      where: { id },
    });
    return data ? this.mapToModel(data) : null;
  }

  async findByResource(resourceId: string, resourceType: string): Promise<ResourcePermission[]> {
    const data = await prisma.resourcePermission.findMany({
      where: {
        resourceId,
        resourceType,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return data.map(d => this.mapToModel(d));
  }

  async findByGrantee(granteeType: GranteeType, granteeId: string | null): Promise<ResourcePermission[]> {
    const data = await prisma.resourcePermission.findMany({
      where: {
        granteeType,
        granteeId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return data.map(d => this.mapToModel(d));
  }

  async findPermission(
    resourceId: string,
    resourceType: string,
    granteeType: GranteeType,
    granteeId: string | null,
    permission: PermissionType
  ): Promise<ResourcePermission | null> {
    const data = await prisma.resourcePermission.findFirst({
      where: {
        resourceId,
        resourceType,
        granteeType,
        granteeId,
        permission,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return data ? this.mapToModel(data) : null;
  }

  /**
   * Check if a user has access to a resource (via direct permission or public/anonymous)
   * Permission inheritance: write implies execute
   */
  async hasAccess(
    resourceId: string,
    resourceType: string,
    permission: PermissionType,
    userId?: string,
    isAnonymous: boolean = false
  ): Promise<boolean> {
    const whereConditions: any[] = [];

    // Check direct user permission
    if (userId) {
      whereConditions.push({
        granteeType: 'user',
        granteeId: userId,
      });
    }

    // Check public access
    whereConditions.push({
      granteeType: 'public',
    });

    // Check anonymous access
    if (isAnonymous) {
      whereConditions.push({
        granteeType: 'anonymous',
      });
    }

    // Build permission conditions - check exact permission
    // Also check write permission if looking for execute (write implies execute)
    const permissionsToCheck = [permission];
    if (permission.endsWith(':execute')) {
      const writePermission = permission.replace(':execute', ':write');
      permissionsToCheck.push(writePermission);
    }

    const result = await prisma.resourcePermission.findFirst({
      where: {
        resourceId,
        resourceType,
        permission: { in: permissionsToCheck },
        OR: whereConditions,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
    });

    return !!result;
  }

  /**
   * Get all resources a user can access with a specific permission
   */
  async getAccessibleResources(
    resourceType: string,
    permission: PermissionType,
    userId?: string,
    isAnonymous: boolean = false
  ): Promise<string[]> {
    const whereConditions: any[] = [];

    // User's direct permissions
    if (userId) {
      whereConditions.push({
        granteeType: 'user',
        granteeId: userId,
      });
    }

    // Public resources
    whereConditions.push({
      granteeType: 'public',
    });

    // Anonymous resources
    if (isAnonymous) {
      whereConditions.push({
        granteeType: 'anonymous',
      });
    }

    const results = await prisma.resourcePermission.findMany({
      where: {
        resourceType,
        permission,
        OR: whereConditions,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        ],
      },
      select: { resourceId: true },
      distinct: ['resourceId'],
    });

    return results.map(r => r.resourceId);
  }

  async create(permission: ResourcePermission): Promise<ResourcePermission> {
    const data = await prisma.resourcePermission.create({
      data: {
        resourceId: permission.resourceId,
        resourceType: permission.resourceType,
        granteeType: permission.granteeType,
        granteeId: permission.granteeId,
        permission: permission.permission,
        grantedBy: permission.grantedBy,
        expiresAt: permission.expiresAt,
      },
    });
    return this.mapToModel(data);
  }

  async delete(id: number): Promise<ResourcePermission> {
    const data = await prisma.resourcePermission.delete({
      where: { id },
    });
    return this.mapToModel(data);
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.resourcePermission.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return result.count;
  }

  /**
   * Delete all permissions for a resource (used when resource is deleted)
   */
  async deleteByResource(resourceId: string, resourceType: string): Promise<number> {
    const result = await prisma.resourcePermission.deleteMany({
      where: { resourceId, resourceType },
    });
    return result.count;
  }

  /**
   * Delete permissions by grantee (used for revoking public/anonymous/role access)
   */
  async deleteByGrantee(
    resourceId: string,
    resourceType: string,
    granteeType: GranteeType,
    granteeId: string | null
  ): Promise<number> {
    const result = await prisma.resourcePermission.deleteMany({
      where: {
        resourceId,
        resourceType,
        granteeType,
        granteeId,
      },
    });
    return result.count;
  }
}
