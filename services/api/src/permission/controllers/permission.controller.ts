import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PermissionService } from "../services/permission.service";
import { Permission } from "../models/permission";
import { injectable } from "tsyringe";


@Route('/api/permissions')
@Tags('Permissions')
@injectable()
export class PermissionController extends Controller {
  private readonly permissionService: PermissionService;
  constructor(permissionService: PermissionService) {
    super();
    this.permissionService = permissionService;
  }

  @Post()
  public async create(
    @Body() requestBody: {
      userId: string,
      resourceId: string,
      resourceType: string,
      publicState: boolean,
      permissionType: string,
      ownerId: string,
      allowed: any
    }): Promise<Permission> {
    const { userId, resourceId, resourceType, publicState, permissionType, ownerId, allowed } = requestBody;
    return await this.permissionService.create(userId, resourceId, resourceType, publicState, permissionType, ownerId, allowed);
  }

  @Post("/has")
    public async searchPermission(
      @Body() requestBody: {
        userId: string,
        resourceId: string,
        resourceType: string,
        permissionType: string,
      }
    ): Promise<Permission> {
      const { userId, resourceId, resourceType, permissionType } = requestBody;
        return await this.permissionService.findPermission(resourceType, resourceId, permissionType, userId);
    }


  @Get("{permissionType}")
  public async findPermissionByType(
    @Path() permissionType: string
  ): Promise<Permission[]> {
    return await this.permissionService.findPermissionByType(permissionType);
  }

  @Get("/resource/{resourceId}")
  public async findPermissionByResourceId(
    @Path() resourceId: string
  ): Promise<Permission> {
    return await this.permissionService.findPermissionByResourceId(resourceId);
  }

  @Put("{id}")
  public async update(
    @Body() requestBody: {
      id: number, userId: string,
      resourceId: string,
      resourceType: string,
      publicState: boolean,
      permissionType: string,
      ownerId: string,
      allowed: any
    }
  ): Promise<Permission> {
    const { id, userId, resourceId, resourceType, publicState, permissionType, ownerId, allowed } = requestBody;
    return await this.permissionService.update(id, userId, resourceId, resourceType, publicState, permissionType, ownerId, allowed);
  }

  @Delete("{id}")
  public async delete(
    @Path() id: number
  ): Promise<Permission> {
    return await this.permissionService.delete(id);
  }





}