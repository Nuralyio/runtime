import { ComponentService } from "../services/component.service";
import { Body, Controller, Delete, Get, Request, Path, Post, Put, Route, Tags } from "tsoa";
import { Component } from "../models/component";
import { CreateComponentRequest } from "../interfaces/CreateComponentRequest";
import { removeNullProperties } from "../../shared/utils/remove-null-properties";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { injectable } from "tsyringe";
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { AuthorizationService } from "../../auth/services/authorization.service";

@Route('/api/components')
@Tags('Components')
@injectable()
export class ComponentController extends Controller {
  constructor(
    private readonly componentService: ComponentService,
    private readonly authorizationService: AuthorizationService
  ) {
    super();
  }

  @Post()
  public async create(
    @Body() requestBody: CreateComponentRequest,
    @Request() request: NRequest
  ): Promise<Component> {
    const applicationId = requestBody.component.applicationId || requestBody.component.application_id;

    if (!applicationId) {
      this.setStatus(400);
      throw new Error('application_id is required');
    }

    // Check if user has permission to create components in this application
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationId,
      'component:create'
    );

    return await this.componentService.create(requestBody.component, request.user.uuid);
  }

  @Get()
  public async findAll(@Request() request: NRequest): Promise<Component[]> {
    // Get all applications user has read access to
    const accessibleApps = await this.authorizationService.getAccessibleResources(
      request.user,
      'application',
      'component:read'
    );

    // Return components from accessible applications
    return await this.componentService.findComponentsByApplications(accessibleApps);
  }

  @Get("/application/{application_id}")
  public async findComponentByApplication(
    @Request() request: NRequest,
    @Path() application_id: string
  ): Promise<Component[]> {
    // Check if user has read permission for components in this application
    await this.authorizationService.requireAppPermission(
      request.user,
      application_id,
      'component:read'
    );

    return await this.componentService.findComponentByApplication(application_id);
  }

  @Get("{uuid}")
  public async findComponentByUuid(
    @Request() request: NRequest,
    @Path() uuid: string
  ): Promise<Component | null> {
    const component = await this.componentService.findComponentByUuid(uuid);

    if (!component) {
      return null;
    }

    // Check read permission via application membership or resource permission
    const canRead = await this.authorizationService.canAccess(
      request.user,
      uuid,
      'component',
      'component:read',
      component.application_id
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return component;
  }

  @Put("{uuid}")
  public async update(
    @Request() request: NRequest,
    @Path() uuid: string,
    @Body() requestBody: { component: { [key: string]: any } }
  ): Promise<Component> {
    const { component } = requestBody;
    let componentToUpdate = await this.componentService.findComponentByUuid(uuid);

    if (componentToUpdate == null) {
      throw new NotFoundException(`Component with uuid ${uuid} not found`);
    }

    // Check write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      componentToUpdate.application_id,
      'component:write'
    );

    componentToUpdate.component = { ...componentToUpdate.component, ...component };
    componentToUpdate = removeNullProperties(componentToUpdate);
    return await this.componentService.update(componentToUpdate as Component, uuid);
  }

  @Delete("{uuid}")
  public async delete(
    @Request() request: NRequest,
    @Path() uuid: string
  ): Promise<Component> {
    const component = await this.componentService.findComponentByUuid(uuid);

    if (!component) {
      throw new NotFoundException(`Component with uuid ${uuid} not found`);
    }

    // Check delete permission
    await this.authorizationService.requireAppPermission(
      request.user,
      component.application_id,
      'component:delete'
    );

    return (await this.componentService.delete([uuid]))[0] ?? null;
  }

  @Delete()
  public async deleteMany(
    @Request() request: NRequest,
    @Body() requestBody: { uuids: string[] }
  ): Promise<Component[]> {
    // Check delete permission for each component
    for (const uuid of requestBody.uuids) {
      const component = await this.componentService.findComponentByUuid(uuid);
      if (component) {
        await this.authorizationService.requireAppPermission(
          request.user,
          component.application_id,
          'component:delete'
        );
      }
    }

    return await this.componentService.delete(requestBody.uuids);
  }
}
