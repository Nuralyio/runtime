import { ApplicationService } from "../services/application.service";
import { Body, Controller, Delete, Get, Hidden, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { Application } from "../models/application";
import { injectable } from "tsyringe";

@Route('/api/applications')
@Tags('Applications')
@injectable()
export class ApplicationController extends Controller {
  private readonly applicationService: ApplicationService;
  constructor( applicationService: ApplicationService) {
    super();
    this.applicationService = applicationService;
  }

  @Post()
  public async create(
    @Body() requestBody: { published: boolean; name: string; uuid:string; user_id:string }): Promise<Application> {
    const { published, name, uuid,user_id } = requestBody;
    return await this.applicationService.create(published,name,uuid,user_id);
  }

  @Get()
  public async findAll(): Promise<Application[]> {
    return await this.applicationService.findAll();
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
