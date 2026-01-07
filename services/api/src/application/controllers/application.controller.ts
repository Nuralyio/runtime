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

  /**
   * Resolve an application by its subdomain (public endpoint - used by gateway)
   * Returns application info including UUID for routing
   */
  @Get("by-subdomain/{subdomain}")
  public async findApplicationBySubdomain(
    @Path() subdomain: string
  ): Promise<{ uuid: string; name: string; subdomain: string } | null> {
    // Validate subdomain format (alphanumeric, hyphens only, 3-63 chars)
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/i;
    if (!subdomainRegex.test(subdomain)) {
      this.setStatus(400);
      throw new Error('Invalid subdomain format');
    }

    const application = await this.applicationService.findApplicationBySubdomain(subdomain);

    if (!application) {
      this.setStatus(404);
      throw new Error('Application not found');
    }

    return {
      uuid: application.uuid,
      name: application.name,
      subdomain: application.subdomain!
    };
  }

  @Put("{uuid}")
  public async update(
    @Request() request: NRequest,
    @Path() uuid: string,
    @Body() requestBody: { published?: boolean; name?: string; user_id?: string; subdomain?: string; requiresAuthOnly?: boolean }
  ): Promise<Application> {
    // Check if user has write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      uuid,
      'application:write'
    );

    const { published, name, user_id, subdomain, requiresAuthOnly } = requestBody;

    // Validate subdomain format if provided
    if (subdomain !== undefined && subdomain !== null) {
      const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/i;
      if (subdomain !== '' && !subdomainRegex.test(subdomain)) {
        this.setStatus(400);
        throw new Error('Invalid subdomain format. Use lowercase alphanumeric characters and hyphens, 3-63 characters.');
      }
    }

    return await this.applicationService.update(published, uuid, name, user_id, subdomain, requiresAuthOnly);
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
