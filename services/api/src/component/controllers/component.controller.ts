import { ComponentService } from "../services/component.service";
import { Body, Controller, Delete, Get, Request, Path, Post, Put, Query, Route, Security, Tags, Middlewares } from "tsoa";
import { Component } from "../models/component";
import { ComponentRepositoryPrismaPgSQL } from "../repositories/component.repository";
import authMiddleware from "../../middlewares/user.middleware";
import { CreateComponentRequest } from "../interfaces/CreateComponentRequest";

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
  @Middlewares([authMiddleware])
  public async create(
    @Body() requestBody : CreateComponentRequest ,
    @Request() request: any,  
  ): Promise<Component> {
    return await this.componentService.create( requestBody.component,request.user.uuid);
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
    @Body() requestBody: { component: any }
  ): Promise<Component> {
    const { component } = requestBody;
    return await this.componentService.update(component, uuid);
  }

  @Delete("{uuid}")
  public async delete(
    @Path() uuid: string
  ): Promise<Component> {
    return await this.componentService.delete(uuid);
  }


}
