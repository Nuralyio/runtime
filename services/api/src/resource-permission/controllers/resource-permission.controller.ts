import { Body, Controller, Delete, Get, Path, Post, Route, Tags, Request } from "tsoa";
import { injectable } from "tsyringe";
import { ResourcePermission, GranteeType, PermissionType } from "../models/resource-permission";
import { ResourcePermissionService } from "../services/resource-permission.service";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { GrantPermissionDto } from "../interfaces/resource-permission.interface";

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
    private readonly authorizationService: AuthorizationService
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
    // User must have share permission or be owner to view permissions
    const canShare = await this.authorizationService.canAccess(
      request.user,
      resourceId,
      resourceType,
      'share'
    );

    if (!canShare) {
      // Check if user is owner/admin of the parent application
      // For now, just check if they have any access
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
    @Path() resourceId: string
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

    const permission = await this.permissionService.makePublic(
      resourceId,
      resourceType,
      request.user.uuid
    );

    return toResponse(permission);
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
