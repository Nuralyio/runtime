import { ApplicationRole } from '../../application-role/models/application-role';

export class ApplicationMember {
  id?: number;
  userId: string;
  applicationId: string;
  roleId: number;
  role?: ApplicationRole;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    userId: string,
    applicationId: string,
    roleId: number,
    role?: ApplicationRole
  ) {
    this.userId = userId;
    this.applicationId = applicationId;
    this.roleId = roleId;
    this.role = role;
  }

  /**
   * Check if this member has a specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.role) {
      return false;
    }
    return this.role.hasPermission(permission);
  }

  /**
   * Check if this member is the owner
   */
  isOwner(): boolean {
    return this.role?.name === 'owner';
  }

  /**
   * Check if this member is an admin or owner
   */
  isAdminOrOwner(): boolean {
    return this.role?.name === 'owner' || this.role?.name === 'admin';
  }

  /**
   * Get the member's hierarchy level
   */
  getHierarchy(): number {
    return this.role?.hierarchy ?? 0;
  }
}
