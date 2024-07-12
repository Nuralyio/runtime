import { ApplicationService } from "../services/application.service";
import { NUser } from "../../auth/domain/user";
import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from "tsoa";
import { Application } from "../models/application";
import { injectable } from "tsyringe";
import { OwnershipService } from "../../ownership/services/owernship.service";
import { ResourcePermissionRequest } from "../../ownership/interfaces/resource-permission.request";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { ApplicationPermission } from "../interfaces/enum/application-permission.enum";
import { ResourceType } from "../../shared/interfaces/enum/resources-type.enum";

@Route('/api/applications')
@Tags('Applications')
@injectable()
export class ApplicationController extends Controller {
  private readonly applicationService: ApplicationService;
  private readonly ownershipService: OwnershipService;
  constructor( applicationService: ApplicationService , ownershipService: OwnershipService) {
    super();
    this.applicationService = applicationService;
    this.ownershipService = ownershipService
  }

  @Post()
  public async create(
    @Body() requestBody: { published: boolean; name: string; uuid:string; user_id:string }): Promise<Application> {
    const { published, name, uuid,user_id } = requestBody;
    return await this.applicationService.create(published,name,uuid,user_id);
  }

  @Get()
  public async findAll(@Request() request: NRequest): Promise<Application[]> {

    const resourcePermissionRequest : ResourcePermissionRequest = {
      user: request.user,
      resourceType: ResourceType.application,
      permissionType: ApplicationPermission.read
    }
    const applicationsIds = await this.ownershipService.getResourceIDWithPermissionOrOwner(resourcePermissionRequest)

    return await this.applicationService.findAll(applicationsIds);
  }

  @Get("{uuid}")
  public async findApplicationById(
    @Path() uuid: string
  ): Promise<Application> {
    return await this.applicationService.findApplicationById(uuid);
  }

  @Put("{uuid}")
  public async update(
    @Path() uuid: string,
    @Body() requestBody: {published:boolean,name: string,user_id:string}
  ): Promise<Application> {
    const { published,name, user_id } = requestBody;
    return await this.applicationService.update(published,uuid,name, user_id);
  }

  @Delete("{uuid}")
  public async delete(
    @Path() uuid: string
  ): Promise<Application> {
    return await this.applicationService.delete(uuid);
  }

}
