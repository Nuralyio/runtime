export class ApplicationRole {
  id?: number;
  applicationId: string | null;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  hierarchy: number;
  createdAt?: Date;

  constructor(
    name: string,
    displayName: string,
    permissions: string[],
    hierarchy: number,
    applicationId: string | null = null,
    description: string | null = null,
    isSystem: boolean = false
  ) {
    this.name = name;
    this.displayName = displayName;
    this.permissions = permissions;
    this.hierarchy = hierarchy;
    this.applicationId = applicationId;
    this.description = description;
    this.isSystem = isSystem;
  }

  /**
   * Check if this role has a specific permission
   * Supports wildcards: "*" = all permissions, "page:*" = all page permissions
   * Permission inheritance: write implies execute (if you can edit, you can run)
   */
  hasPermission(permission: string): boolean {
    // Owner has all permissions
    if (this.permissions.includes('*')) {
      return true;
    }

    // Check exact match
    if (this.permissions.includes(permission)) {
      return true;
    }

    // Check wildcard match (e.g., "page:*" matches "page:read")
    const [resource, action] = permission.split(':');
    if (this.permissions.includes(`${resource}:*`)) {
      return true;
    }

    // Permission inheritance: write implies execute
    // If checking for execute and user has write, grant access
    if (action === 'execute' && this.permissions.includes(`${resource}:write`)) {
      return true;
    }

    return false;
  }

  /**
   * Check if this role can assign another role based on hierarchy
   */
  canAssignRole(targetHierarchy: number): boolean {
    return this.hierarchy > targetHierarchy;
  }
}
