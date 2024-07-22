import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PermissionService } from "../services/permission.service";
import { Permission } from "../models/permission";
import { injectable } from "tsyringe";


@Route('/api/permissions')
@Tags('Permissions')

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


  @Get("{permissionType}")
  public async findPermissionByType(
    @Path() permissionType: string
  ): Promise<Permission[]> {
    return await this.permissionService.findPermissionByType(permissionType);
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