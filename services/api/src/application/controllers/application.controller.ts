import { ApplicationService } from "../services/application.service";
import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from "tsoa";
import { Application } from "../models/application";
import { injectable } from "tsyringe";
import { AuthorizationService } from "../../auth/services/authorization.service";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { v4 as uuidv4 } from 'uuid';

@Route('/api/applications')
@Tags('Applications')
@injectable()
export class ApplicationController extends Controller {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly authorizationService: AuthorizationService
  ) {
    super();
  }

  @Post()
  public async create(
    @Request() request: NRequest,
    @Body() requestBody: { name?: string }
  ): Promise<Application> {
    const { name } = requestBody;

    // Anonymous users cannot create applications
    if (request.user.anonymous) {
      this.setStatus(401);
      throw new Error('Authentication required to create applications');
    }

    return await this.applicationService.create(false, uuidv4(), request.user.uuid, name);
  }

  @Get()
  public async findAll(@Request() request: NRequest): Promise<Application[]> {
    console.log(`[APP CONTROLLER] User: ${JSON.stringify(request.user)}`);

    // Get all applications the user can read (via membership or resource permissions)
    const applicationsIds = await this.authorizationService.getAccessibleResources(
      request.user,
      'application',
      'application:read'
    );

    console.log(`[APP CONTROLLER] Application IDs found: ${JSON.stringify(applicationsIds)}`);
    return await this.applicationService.findAll(applicationsIds);
  }

  @Get("{uuid}")
  public async findApplicationById(
    @Request() request: NRequest,
    @Path() uuid: string
  ): Promise<Application> {
    // Check if user has read permission
    const canRead = await this.authorizationService.canAccess(
      request.user,
      uuid,
      'application',
      'application:read',
      uuid
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return await this.applicationService.findApplicationById(uuid);
  }

  @Put("{uuid}")
  public async update(
    @Request() request: NRequest,
    @Path() uuid: string,
    @Body() requestBody: { published: boolean; name: string; user_id: string }
  ): Promise<Application> {
    // Check if user has write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      uuid,
      'application:write'
    );

    const { published, name, user_id } = requestBody;
    return await this.applicationService.update(published, uuid, name, user_id);
  }

  @Delete("{uuid}")
  public async delete(
    @Request() request: NRequest,
    @Path() uuid: string
  ): Promise<Application> {
    // Only owners can delete applications
    const isOwner = await this.authorizationService.isOwner(request.user, uuid);

    if (!isOwner) {
      this.setStatus(403);
      throw new Error('Access denied: only owners can delete applications');
    }

    return await this.applicationService.delete(uuid);
  }
}
