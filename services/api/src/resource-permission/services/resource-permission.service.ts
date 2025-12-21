import { singleton } from 'tsyringe';
import { ResourcePermission, GranteeType, PermissionType } from '../models/resource-permission';
import { ResourcePermissionRepository } from '../repositories/resource-permission.repository';
import { GrantPermissionDto } from '../interfaces/resource-permission.interface';

@singleton()
export class ResourcePermissionService {
  constructor(private readonly repository: ResourcePermissionRepository) {}

  /**
   * Get all permissions for a resource
   */
  async getResourcePermissions(resourceId: string, resourceType: string): Promise<ResourcePermission[]> {
    return this.repository.findByResource(resourceId, resourceType);
  }

  /**
   * Grant a permission on a resource (upsert - returns existing if already exists)
   */
  async grantPermission(
    resourceId: string,
    resourceType: string,
    grantedBy: string,
    dto: GrantPermissionDto
  ): Promise<ResourcePermission> {
    // Validate granteeId for user/role grantee types
    if ((dto.granteeType === 'user' || dto.granteeType === 'role') && !dto.granteeId) {
      throw new Error(`granteeId is required for grantee type "${dto.granteeType}"`);
    }

    // Check if permission already exists - return it if so (idempotent)
    const existing = await this.repository.findPermission(
      resourceId,
      resourceType,
      dto.granteeType,
      dto.granteeId || null,
      dto.permission
    );

    if (existing) {
      return existing;
    }

    const permission = new ResourcePermission(
      resourceId,
      resourceType,
      dto.granteeType,
      dto.permission,
      grantedBy,
      dto.granteeId || null,
      dto.expiresAt || null
    );

    return this.repository.create(permission);
  }

  /**
   * Revoke a permission
   */
  async revokePermission(id: number): Promise<ResourcePermission> {
    const permission = await this.repository.findById(id);
    if (!permission) {
      throw new Error('Permission not found');
    }
    return this.repository.delete(id);
  }

  /**
   * Check if a user has access to a resource
   */
  async hasAccess(
    resourceId: string,
    resourceType: string,
    permission: PermissionType,
    userId?: string,
    isAnonymous: boolean = false
  ): Promise<boolean> {
    return this.repository.hasAccess(resourceId, resourceType, permission, userId, isAnonymous);
  }

  /**
   * Get all resources a user can access
   */
  async getAccessibleResources(
    resourceType: string,
    permission: PermissionType,
    userId?: string,
    isAnonymous: boolean = false
  ): Promise<string[]> {
    return this.repository.getAccessibleResources(resourceType, permission, userId, isAnonymous);
  }

  /**
   * Make a resource public
   */
  async makePublic(
    resourceId: string,
    resourceType: string,
    grantedBy: string,
    permission: PermissionType = 'read'
  ): Promise<ResourcePermission> {
    return this.grantPermission(resourceId, resourceType, grantedBy, {
      granteeType: 'public',
      permission,
    });
  }

  /**
   * Make a resource accessible to anonymous users
   */
  async allowAnonymous(
    resourceId: string,
    resourceType: string,
    grantedBy: string,
    permission: PermissionType = 'read'
  ): Promise<ResourcePermission> {
    return this.grantPermission(resourceId, resourceType, grantedBy, {
      granteeType: 'anonymous',
      permission,
    });
  }

  /**
   * Share a resource with a specific user
   */
  async shareWithUser(
    resourceId: string,
    resourceType: string,
    grantedBy: string,
    userId: string,
    permission: PermissionType = 'read',
    expiresAt?: Date
  ): Promise<ResourcePermission> {
    return this.grantPermission(resourceId, resourceType, grantedBy, {
      granteeType: 'user',
      granteeId: userId,
      permission,
      expiresAt,
    });
  }

  /**
   * Grant role-based permission on a resource
   */
  async grantRolePermission(
    resourceId: string,
    resourceType: string,
    grantedBy: string,
    roleName: string,
    permission: PermissionType = 'read'
  ): Promise<ResourcePermission> {
    return this.grantPermission(resourceId, resourceType, grantedBy, {
      granteeType: 'role',
      granteeId: roleName,
      permission,
    });
  }

  /**
   * Revoke role-based permission from a resource
   */
  async revokeRolePermission(
    resourceId: string,
    resourceType: string,
    roleName: string
  ): Promise<number> {
    return this.repository.deleteByGrantee(resourceId, resourceType, 'role', roleName);
  }

  /**
   * Revoke public access from a resource
   */
  async revokePublicAccess(resourceId: string, resourceType: string): Promise<number> {
    return this.repository.deleteByGrantee(resourceId, resourceType, 'public', null);
  }

  /**
   * Revoke anonymous access from a resource
   */
  async revokeAnonymousAccess(resourceId: string, resourceType: string): Promise<number> {
    return this.repository.deleteByGrantee(resourceId, resourceType, 'anonymous', null);
  }

  /**
   * Delete all permissions for a resource (used when resource is deleted)
   */
  async deleteResourcePermissions(resourceId: string, resourceType: string): Promise<number> {
    return this.repository.deleteByResource(resourceId, resourceType);
  }

  /**
   * Clean up expired permissions
   */
  async cleanupExpired(): Promise<number> {
    return this.repository.deleteExpired();
  }
}
