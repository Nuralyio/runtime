import { Body, Controller, Delete, Get, Path, Post, Route, Tags, Request } from "tsoa";
import { injectable } from "tsyringe";
import { ResourcePermission, GranteeType, PermissionType } from "../models/resource-permission";
import { ResourcePermissionService } from "../services/resource-permission.service";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { GrantPermissionDto } from "../interfaces/resource-permission.interface";
import { PageRepository } from "../../page/repositories/page.repository";
import { ComponentRepository } from "../../component/repositories/component.repository";

interface PermissionResponse {
  id: number;
  resourceId: string;
  resourceType: string;
  granteeType: string;
  granteeId: string | null;
  permission: string;
  grantedBy: string;
  expiresAt: Date | null;
  createdAt: Date;
}

function toResponse(perm: ResourcePermission): PermissionResponse {
  return {
    id: perm.id!,
    resourceId: perm.resourceId,
    resourceType: perm.resourceType,
    granteeType: perm.granteeType,
    granteeId: perm.granteeId,
    permission: perm.permission,
    grantedBy: perm.grantedBy,
    expiresAt: perm.expiresAt,
    createdAt: perm.createdAt!,
  };
}

@Route('/api/resources')
@Tags('Resource Permissions')
@injectable()
export class ResourcePermissionController extends Controller {
  constructor(
    private readonly permissionService: ResourcePermissionService,
    private readonly authorizationService: AuthorizationService,
    private readonly pageRepository: PageRepository,
    private readonly componentRepository: ComponentRepository
  ) {
    super();
  }

  /**
   * Get all permissions for a specific resource
   */
  @Get('{resourceType}/{resourceId}/permissions')
  public async getResourcePermissions(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string
  ): Promise<PermissionResponse[]> {
    // For pages and components, check app-level permission
    // The applicationId comes from the resource lookup or query param
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);

    if (applicationId) {
      // Check if user has permission to view/share in the application
      const hasAppPermission = await this.authorizationService.hasAppPermission(
        request.user,
        applicationId,
        `${resourceType}:read`
      );

      if (!hasAppPermission) {
        this.setStatus(403);
        throw new Error('Access denied');
      }
    } else {
      // For application-level resources, check direct access
      const canRead = await this.authorizationService.canAccess(
        request.user,
        resourceId,
        resourceType,
        'read'
      );

      if (!canRead) {
        this.setStatus(403);
        throw new Error('Access denied');
      }
    }

    const permissions = await this.permissionService.getResourcePermissions(resourceId, resourceType);
    return permissions.map(toResponse);
  }

  /**
   * Grant permission on a resource
   */
  @Post('{resourceType}/{resourceId}/permissions')
  public async grantPermission(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Body() body: GrantPermissionDto
  ): Promise<PermissionResponse> {
    // User must have share permission to grant permissions
    const canShare = await this.authorizationService.canAccess(
      request.user,
      resourceId,
      resourceType,
      'share'
    );

    if (!canShare) {
      this.setStatus(403);
      throw new Error('Access denied: you need share permission to grant access');
    }

    // Users can only grant permissions they themselves have
    if (body.permission !== 'read') {
      const hasPermission = await this.authorizationService.canAccess(
        request.user,
        resourceId,
        resourceType,
        body.permission
      );

      if (!hasPermission) {
        this.setStatus(403);
        throw new Error(`Access denied: you cannot grant "${body.permission}" permission`);
      }
    }

    const permission = await this.permissionService.grantPermission(
      resourceId,
      resourceType,
      request.user.uuid,
      body
    );

    return toResponse(permission);
  }

  /**
   * Revoke a permission
   */
  @Delete('{resourceType}/{resourceId}/permissions/{permissionId}')
  public async revokePermission(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Path() permissionId: number
  ): Promise<{ success: boolean; message: string }> {
    // User must have share permission or be the one who granted it
    const canShare = await this.authorizationService.canAccess(
      request.user,
      resourceId,
      resourceType,
      'share'
    );

    if (!canShare) {
      this.setStatus(403);
      throw new Error('Access denied: you need share permission to revoke access');
    }

    await this.permissionService.revokePermission(permissionId);
    return { success: true, message: 'Permission revoked successfully' };
  }

  /**
   * Make a resource public (anyone with link can view)
   */
  @Post('{resourceType}/{resourceId}/make-public')
  public async makePublic(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Body() body?: { permission?: PermissionType }
  ): Promise<PermissionResponse> {
    // Check for app-level permission for pages/components
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);
    if (applicationId) {
      await this.authorizationService.requireAppPermission(
        request.user,
        applicationId,
        `${resourceType}:share`
      );
    }

    const permission = await this.permissionService.makePublic(
      resourceId,
      resourceType,
      request.user.uuid,
      body?.permission || 'read'
    );

    return toResponse(permission);
  }

  /**
   * Remove public access from a resource
   */
  @Delete('{resourceType}/{resourceId}/make-public')
  public async removePublic(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string
  ): Promise<{ success: boolean; message: string }> {
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);
    if (applicationId) {
      await this.authorizationService.requireAppPermission(
        request.user,
        applicationId,
        `${resourceType}:share`
      );
    }

    await this.permissionService.revokePublicAccess(resourceId, resourceType);
    return { success: true, message: 'Public access removed' };
  }

  /**
   * Allow anonymous access to a resource
   */
  @Post('{resourceType}/{resourceId}/make-anonymous')
  public async makeAnonymous(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Body() body?: { permission?: PermissionType }
  ): Promise<PermissionResponse> {
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);
    if (applicationId) {
      await this.authorizationService.requireAppPermission(
        request.user,
        applicationId,
        `${resourceType}:share`
      );
    }

    const permission = await this.permissionService.allowAnonymous(
      resourceId,
      resourceType,
      request.user.uuid,
      body?.permission || 'read'
    );

    return toResponse(permission);
  }

  /**
   * Remove anonymous access from a resource
   */
  @Delete('{resourceType}/{resourceId}/make-anonymous')
  public async removeAnonymous(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string
  ): Promise<{ success: boolean; message: string }> {
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);
    if (applicationId) {
      await this.authorizationService.requireAppPermission(
        request.user,
        applicationId,
        `${resourceType}:share`
      );
    }

    await this.permissionService.revokeAnonymousAccess(resourceId, resourceType);
    return { success: true, message: 'Anonymous access removed' };
  }

  /**
   * Grant role-based permission on a resource
   */
  @Post('{resourceType}/{resourceId}/role-permission')
  public async grantRolePermission(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Body() body: { roleName: string; permission: PermissionType }
  ): Promise<PermissionResponse> {
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);
    if (applicationId) {
      await this.authorizationService.requireAppPermission(
        request.user,
        applicationId,
        `${resourceType}:share`
      );
    }

    const permission = await this.permissionService.grantRolePermission(
      resourceId,
      resourceType,
      request.user.uuid,
      body.roleName,
      body.permission
    );

    return toResponse(permission);
  }

  /**
   * Revoke role-based permission from a resource
   */
  @Delete('{resourceType}/{resourceId}/role-permission/{roleName}')
  public async revokeRolePermission(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Path() roleName: string
  ): Promise<{ success: boolean; message: string }> {
    const applicationId = await this.getApplicationIdFromResource(resourceType, resourceId);
    if (applicationId) {
      await this.authorizationService.requireAppPermission(
        request.user,
        applicationId,
        `${resourceType}:share`
      );
    }

    await this.permissionService.revokeRolePermission(resourceId, resourceType, roleName);
    return { success: true, message: 'Role permission revoked' };
  }

  /**
   * Check if a resource allows anonymous access (public endpoint - no auth required)
   * Used by the gateway to determine if authentication should be bypassed
   */
  @Get('{resourceType}/{resourceId}/check-anonymous')
  public async checkAnonymousAccess(
    @Path() resourceType: string,
    @Path() resourceId: string
  ): Promise<{ allowed: boolean; permission: string | null }> {
    const hasAnonymousAccess = await this.permissionService.hasAccess(
      resourceId,
      resourceType,
      'read',
      undefined,
      true // isAnonymous
    );

    if (hasAnonymousAccess) {
      return { allowed: true, permission: 'read' };
    }

    return { allowed: false, permission: null };
  }

  /**
   * Get the application ID for a resource (page or component) from database
   */
  private async getApplicationIdFromResource(resourceType: string, resourceId: string): Promise<string | null> {
    if (resourceType === 'application') {
      return resourceId;
    }

    // Look up the application_id from the database
    if (resourceType === 'page') {
      const page = await this.pageRepository.findPageByUUID(resourceId);
      return page?.application_id || null;
    }

    if (resourceType === 'component') {
      const component = await this.componentRepository.findComponentByUuid(resourceId);
      return component?.application_id || null;
    }

    return null;
  }

  /**
   * Share a resource with a specific user
   */
  @Post('{resourceType}/{resourceId}/share')
  public async shareWithUser(
    @Request() request: NRequest,
    @Path() resourceType: string,
    @Path() resourceId: string,
    @Body() body: { userId: string; permission?: PermissionType; expiresAt?: string }
  ): Promise<PermissionResponse> {
    // User must have share permission
    const canShare = await this.authorizationService.canAccess(
      request.user,
      resourceId,
      resourceType,
      'share'
    );

    if (!canShare) {
      this.setStatus(403);
      throw new Error('Access denied: you need share permission');
    }

    const permission = await this.permissionService.shareWithUser(
      resourceId,
      resourceType,
      request.user.uuid,
      body.userId,
      body.permission || 'read',
      body.expiresAt ? new Date(body.expiresAt) : undefined
    );

    return toResponse(permission);
  }
}
