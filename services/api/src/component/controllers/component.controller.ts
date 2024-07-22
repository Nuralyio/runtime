import { ComponentService } from "../services/component.service";
import { Body, Controller, Delete, Get, Hidden, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { Component } from "../models/component";
import { ComponentRepositoryPrismaPgSQL } from "../repositories/component.repository";

@Route('/api/components')
@Tags('Components')
export class ComponentController extends Controller {
  private readonly componentService: ComponentService;

  constructor() {
    super();
    const componentRepository = new ComponentRepositoryPrismaPgSQL();
    this.componentService = new ComponentService(componentRepository);
  }

  @Post()
  public async create(
    @Body() requestBody: { component: object, user_id: string, uuid: string, application_id: string }): Promise<Component> {
    const { component, user_id, application_id, uuid } = requestBody;
    return await this.componentService.create(component, user_id, uuid, application_id);
  }

  @Get()
  public async findAll(): Promise<Component[]> {
    return await this.componentService.findAll();
  }

  @Get("/application/{application_id}")
  public async findComponentByApplication(
    @Path() application_id: string
  ): Promise<Component[]> {
    return await this.componentService.findComponentByApplication(application_id);
  }

  @Put("{uuid}")
  public async update(
    @Path() uuid: string,
    @Body() requestBody: { component: object, user_id: string, application_id: string }
  ): Promise<Component> {
    const { component, user_id, application_id } = requestBody;
    return await this.componentService.update(component, user_id, uuid, application_id);
  }

  @Delete("{uuid}")
  public async delete(
    @Path() uuid: string
  ): Promise<Component> {
    return await this.componentService.delete(uuid);
  }


}
