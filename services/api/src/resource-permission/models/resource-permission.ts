export type GranteeType = 'user' | 'role' | 'public' | 'anonymous';
export type PermissionType = 'read' | 'write' | 'delete' | 'share';

export class ResourcePermission {
  id?: number;
  resourceId: string;
  resourceType: string;
  granteeType: GranteeType;
  granteeId: string | null;
  permission: PermissionType;
  grantedBy: string;
  expiresAt: Date | null;
  createdAt?: Date;

  constructor(
    resourceId: string,
    resourceType: string,
    granteeType: GranteeType,
    permission: PermissionType,
    grantedBy: string,
    granteeId: string | null = null,
    expiresAt: Date | null = null
  ) {
    this.resourceId = resourceId;
    this.resourceType = resourceType;
    this.granteeType = granteeType;
    this.granteeId = granteeId;
    this.permission = permission;
    this.grantedBy = grantedBy;
    this.expiresAt = expiresAt;
  }

  /**
   * Check if this permission is expired
   */
  isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  /**
   * Check if this permission is public (anyone with link)
   */
  isPublic(): boolean {
    return this.granteeType === 'public';
  }

  /**
   * Check if this permission allows anonymous access
   */
  isAnonymous(): boolean {
    return this.granteeType === 'anonymous';
  }
}
