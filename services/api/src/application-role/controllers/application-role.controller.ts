import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from "tsoa";
import { injectable } from "tsyringe";
import { ApplicationRole } from "../models/application-role";
import { ApplicationRoleService } from "../services/application-role.service";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { CreateRoleDto, UpdateRoleDto } from "../interfaces/application-role.interface";

interface RoleResponse {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
  applicationId: string | null;
}

function toResponse(role: ApplicationRole): RoleResponse {
  return {
    id: role.id!,
    name: role.name,
    displayName: role.displayName,
    description: role.description,
    permissions: role.permissions,
    hierarchy: role.hierarchy,
    isSystem: role.isSystem,
    applicationId: role.applicationId,
  };
}

@Route('/api/roles')
@Tags('Roles')
@injectable()
export class SystemRoleController extends Controller {
  constructor(private readonly roleService: ApplicationRoleService) {
    super();
  }

  /**
   * Get all system roles (owner, admin, editor, viewer)
   * These are the default roles available to all applications
   */
  @Get('system')
  public async getSystemRoles(): Promise<RoleResponse[]> {
    const roles = await this.roleService.getSystemRoles();
    return roles.map(toResponse);
  }
}

@Route('/api/applications/{applicationId}/roles')
@Tags('Application Roles')
@injectable()
export class ApplicationRoleController extends Controller {
  constructor(
    private readonly roleService: ApplicationRoleService,
    private readonly authorizationService: AuthorizationService
  ) {
    super();
  }

  /**
   * Get all roles available for an application (system + custom roles)
   */
  @Get()
  public async getRoles(
    @Request() request: NRequest,
    @Path() applicationId: string
  ): Promise<RoleResponse[]> {
    // Check if user has permission to view roles
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'role:read'
    );

    const roles = await this.roleService.getRolesForApplication(applicationId);
    return roles.map(toResponse);
  }

  /**
   * Get a specific role by ID
   */
  @Get('{roleId}')
  public async getRole(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() roleId: number
  ): Promise<RoleResponse> {
    // Check if user has permission to view roles
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'role:read'
    );

    const role = await this.roleService.getRoleById(roleId);
    if (!role) {
      this.setStatus(404);
      throw new Error('Role not found');
    }

    // Verify role belongs to this application or is a system role
    if (role.applicationId !== null && role.applicationId !== applicationId) {
      this.setStatus(404);
      throw new Error('Role not found');
    }

    return toResponse(role);
  }

  /**
   * Create a custom role for an application
   */
  @Post()
  public async createRole(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Body() body: CreateRoleDto
  ): Promise<RoleResponse> {
    // Check if user has permission to create roles (typically owner only)
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'role:create'
    );

    const role = await this.roleService.createCustomRole(applicationId, body);
    return toResponse(role);
  }

  /**
   * Update a custom role
   */
  @Put('{roleId}')
  public async updateRole(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() roleId: number,
    @Body() body: UpdateRoleDto
  ): Promise<RoleResponse> {
    // Check if user has permission to update roles
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'role:update'
    );

    // Verify role belongs to this application
    const existingRole = await this.roleService.getRoleById(roleId);
    if (!existingRole || existingRole.applicationId !== applicationId) {
      this.setStatus(404);
      throw new Error('Role not found');
    }

    const role = await this.roleService.updateRole(roleId, body);
    return toResponse(role);
  }

  /**
   * Delete a custom role
   */
  @Delete('{roleId}')
  public async deleteRole(
    @Request() request: NRequest,
    @Path() applicationId: string,
    @Path() roleId: number
  ): Promise<{ success: boolean; message: string }> {
    // Check if user has permission to delete roles
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'role:delete'
    );

    // Verify role belongs to this application
    const existingRole = await this.roleService.getRoleById(roleId);
    if (!existingRole || existingRole.applicationId !== applicationId) {
      this.setStatus(404);
      throw new Error('Role not found');
    }

    await this.roleService.deleteRole(roleId);
    return { success: true, message: 'Role deleted successfully' };
  }
}
