import { Body, Controller, Delete, Get, Path, Post, Route, Tags, Request } from "tsoa";
import { injectable } from "tsyringe";
import { ResourcePermission, GranteeType, PermissionType } from "../models/resource-permission";
import { ResourcePermissionService } from "../services/resource-permission.service";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { GrantPermissionDto } from "../interfaces/resource-permission.interface";
import { PageRepository } from "../../page/repositories/page.repository";
import { ComponentRepository } from "../../component/repositories/component.repository";
import { NotFoundException } from "../../exceptions/NotFoundException";

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
      const canRead = await this.authorizationService.canAccess(
        request.user,
        applicationId,
        'application',
        `${resourceType}:read`
      );

      if (!canRead) {
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
   *
   * Returns:
   * - allowed: true if anonymous access is explicitly granted
   * - restricted: true if the resource explicitly requires authentication (page-level)
   * - permission: the permission level if allowed
   */
  @Get('{resourceType}/{resourceId}/check-anonymous')
  public async checkAnonymousAccess(
    @Path() resourceType: string,
    @Path() resourceId: string
  ): Promise<{ allowed: boolean; restricted: boolean; permission: string | null }> {
    // Check for explicit anonymous permission
    const hasAnonymousAccess = await this.permissionService.hasAccess(
      resourceId,
      resourceType,
      'read',
      undefined,
      true // isAnonymous
    );

    if (hasAnonymousAccess) {
      return { allowed: true, restricted: false, permission: 'read' };
    }

    // Pages without explicit anonymous permission are considered "restricted"
    // They will NOT inherit anonymous access from the parent application
    if (resourceType === 'page') {
      return { allowed: false, restricted: true, permission: null };
    }

    // Non-page resources (components, etc.) can inherit from parent application
    return { allowed: false, restricted: false, permission: null };
  }

  /**
   * Check if a page allows anonymous access by URL slug within an application
   * Used by the gateway for preview routes with URL slugs like /app/preview/{appId}/blog1
   *
   * This endpoint resolves the page by URL slug first, then checks anonymous access
   *
   * Returns:
   * - allowed: true if anonymous access is explicitly granted
   * - restricted: true if the resource explicitly requires authentication
   * - permission: the permission level if allowed
   * - pageUuid: the resolved page UUID (useful for further operations)
   */
  @Get('page/by-url/{applicationId}/{pageUrl}/check-anonymous')
  public async checkAnonymousAccessByPageUrl(
    @Path() applicationId: string,
    @Path() pageUrl: string
  ): Promise<{ allowed: boolean; restricted: boolean; permission: string | null; pageUuid: string | null }> {
    // Validate applicationId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(applicationId)) {
      return { allowed: false, restricted: false, permission: null, pageUuid: null };
    }

    // Validate pageUrl format (alphanumeric, hyphens, underscores, or UUID)
    const pageUrlRegex = /^[a-zA-Z0-9_-]+$/;
    if (!pageUrlRegex.test(pageUrl) && !uuidRegex.test(pageUrl)) {
      return { allowed: false, restricted: false, permission: null, pageUuid: null };
    }

    // First, try to find the page by URL slug in the application
    let page = await this.pageRepository.findPageByUrlInApplication(applicationId, pageUrl);

    // If not found by URL, check if pageUrl is actually a UUID
    if (!page) {
      try {
        page = await this.pageRepository.findPageByUUID(pageUrl);
        // Verify the page belongs to this application
        if (page && page.application_id !== applicationId) {
          page = null;
        }
      } catch (error) {
        // Only swallow NotFoundException, re-throw unexpected errors
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
        page = null;
      }
    }

    // If page still not found, return not allowed (gateway will require auth)
    if (!page) {
      return { allowed: false, restricted: false, permission: null, pageUuid: null };
    }

    // Check for explicit anonymous permission on this page
    const hasAnonymousAccess = await this.permissionService.hasAccess(
      page.uuid,
      'page',
      'read',
      undefined,
      true // isAnonymous
    );

    if (hasAnonymousAccess) {
      return { allowed: true, restricted: false, permission: 'read', pageUuid: page.uuid };
    }

    // Page exists but doesn't have anonymous access - it's restricted
    return { allowed: false, restricted: true, permission: null, pageUuid: page.uuid };
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
