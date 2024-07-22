import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags } from "tsoa";
import { PageService } from "../services/page.service";
import { Page } from "../models/page";
import { injectable } from "tsyringe";


@Route('/api/pages')
@Tags('Pages')
@injectable()
export class PageController extends Controller {
    private readonly pageService: PageService;
    constructor(pageService: PageService) {
        super();
        this.pageService = pageService;
    }

    @Post()
    public async create(
        @Body() requestBody: {
            name: string;
            url: string;
            application_id: string;
            user_id: string;
            uuid: string;
            need_authentification: boolean; 
            component_ids: string[]
        }): Promise<Page> {
        const { name, url, application_id, user_id, uuid, need_authentification, component_ids } = requestBody;
        return await this.pageService.create(name, url, application_id, user_id, uuid, need_authentification , component_ids);
    }


    @Get("{uuid}")
    public async findPageByUUID(
        @Path() uuid: string
    ): Promise<Page> {
        return await this.pageService.findPageByUUID(uuid);
    }

    @Get("application/{uuid}")
    public async findPagesByApplicationUUID(
        @Path() uuid: string
    ): Promise<Page[]> {
        return await this.pageService.findPagesByApplicationUUID(uuid);
    }

    @Put("{id}")
    public async update(
        @Body() requestBody: {
            id: number, name: string,
            url: string,
            application_id: string,
            user_id: string,
            uuid: string,
            need_authentification: boolean;
            component_ids: string[]
        }
    ): Promise<Page> {
        const { id, name, url, application_id, user_id, uuid, need_authentification, component_ids} = requestBody;
        return await this.pageService.update(id, name, url, application_id, user_id, uuid, need_authentification, component_ids);
    }

    @Delete("{id}")
    public async delete(
        @Path() id: number
    ): Promise<Page> {
        return await this.pageService.delete(id);
    }





}