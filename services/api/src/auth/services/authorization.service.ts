import { singleton } from 'tsyringe';
import { ApplicationMemberService } from '../../application-member/services/application-member.service';
import { ResourcePermissionService } from '../../resource-permission/services/resource-permission.service';
import { PermissionType } from '../../resource-permission/models/resource-permission';

export interface IUser {
  uuid: string;
  anonymous: boolean;
  roles?: string[];
}

@singleton()
export class AuthorizationService {
  constructor(
    private readonly memberService: ApplicationMemberService,
    private readonly resourcePermissionService: ResourcePermissionService
  ) {}

  /**
   * Check if a user can access a specific resource with a given permission.
   *
   * Permission Check Order (per architecture doc):
   * 1. Check ResourcePermission (most specific - direct user/public/anonymous access)
   * 2. Check ApplicationMember role permissions (via application membership)
   * 3. Check public/anonymous access
   * 4. DENY if none match
   */
  async canAccess(
    user: IUser,
    resourceId: string,
    resourceType: string,
    permission: string,
    applicationId?: string
  ): Promise<boolean> {
    // 1. Check direct resource permissions (user, public, anonymous)
    const hasResourcePermission = await this.resourcePermissionService.hasAccess(
      resourceId,
      resourceType,
      permission as PermissionType,
      user.anonymous ? undefined : user.uuid,
      user.anonymous
    );

    if (hasResourcePermission) {
      return true;
    }

    // 2. Check application membership (if applicationId provided)
    if (applicationId && !user.anonymous) {
      const hasRolePermission = await this.memberService.hasPermission(
        user.uuid,
        applicationId,
        permission
      );

      if (hasRolePermission) {
        return true;
      }
    }

    // 3. DENY
    return false;
  }

  /**
   * Get all resources a user can access with a specific permission.
   * Combines:
   * - Resources with direct ResourcePermission grants
   * - Resources in applications where user has the required role permission
   */
  async getAccessibleResources(
    user: IUser,
    resourceType: string,
    permission: string
  ): Promise<string[]> {
    const accessibleIds = new Set<string>();

    // 1. Get resources with direct permissions
    const directAccess = await this.resourcePermissionService.getAccessibleResources(
      resourceType,
      permission as PermissionType,
      user.anonymous ? undefined : user.uuid,
      user.anonymous
    );

    directAccess.forEach(id => accessibleIds.add(id));

    // 2. For application-type resources, check membership
    if (resourceType === 'application' && !user.anonymous) {
      const memberApps = await this.memberService.getApplicationsWithPermission(
        user.uuid,
        permission
      );

      memberApps.forEach(id => accessibleIds.add(id));
    }

    return Array.from(accessibleIds);
  }

  /**
   * Check if a user has a specific permission in an application context.
   * This is used for operations within an application (pages, components, etc.)
   */
  async hasAppPermission(
    user: IUser,
    applicationId: string,
    permission: string
  ): Promise<boolean> {
    if (user.anonymous) {
      return false;
    }

    return this.memberService.hasPermission(user.uuid, applicationId, permission);
  }

  /**
   * Check if a user is the owner of an application
   */
  async isOwner(user: IUser, applicationId: string): Promise<boolean> {
    if (user.anonymous) {
      return false;
    }

    const member = await this.memberService.getMember(user.uuid, applicationId);
    return member?.isOwner() ?? false;
  }

  /**
   * Check if a user is an admin or owner of an application
   */
  async isAdminOrOwner(user: IUser, applicationId: string): Promise<boolean> {
    if (user.anonymous) {
      return false;
    }

    const member = await this.memberService.getMember(user.uuid, applicationId);
    return member?.isAdminOrOwner() ?? false;
  }

  /**
   * Ensure user has permission, throw error if not
   */
  async requirePermission(
    user: IUser,
    resourceId: string,
    resourceType: string,
    permission: string,
    applicationId?: string
  ): Promise<void> {
    const hasAccess = await this.canAccess(user, resourceId, resourceType, permission, applicationId);
    if (!hasAccess) {
      throw new Error(`Access denied: missing "${permission}" permission on ${resourceType}`);
    }
  }

  /**
   * Ensure user has app-level permission, throw error if not
   */
  async requireAppPermission(
    user: IUser,
    applicationId: string,
    permission: string
  ): Promise<void> {
    const hasPermission = await this.hasAppPermission(user, applicationId, permission);
    if (!hasPermission) {
      throw new Error(`Access denied: missing "${permission}" permission in application`);
    }
  }
}
