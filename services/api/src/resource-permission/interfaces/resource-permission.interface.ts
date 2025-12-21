import { ResourcePermission, GranteeType, PermissionType } from '../models/resource-permission';

export interface IResourcePermissionRepository {
  findById(id: number): Promise<ResourcePermission | null>;
  findByResource(resourceId: string, resourceType: string): Promise<ResourcePermission[]>;
  findByGrantee(granteeType: GranteeType, granteeId: string | null): Promise<ResourcePermission[]>;
  findPermission(
    resourceId: string,
    resourceType: string,
    granteeType: GranteeType,
    granteeId: string | null,
    permission: PermissionType
  ): Promise<ResourcePermission | null>;
  create(permission: ResourcePermission): Promise<ResourcePermission>;
  delete(id: number): Promise<ResourcePermission>;
  deleteExpired(): Promise<number>;
  deleteByResource(resourceId: string, resourceType: string): Promise<number>;
  deleteByGrantee(
    resourceId: string,
    resourceType: string,
    granteeType: GranteeType,
    granteeId: string | null
  ): Promise<number>;
}

export interface GrantPermissionDto {
  granteeType: GranteeType;
  granteeId?: string;
  permission: PermissionType;
  expiresAt?: Date;
}

export interface CheckAccessDto {
  userId: string;
  userRoles?: string[];
  isAnonymous: boolean;
}
