import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from "tsoa";
import { PageService } from "../services/page.service";
import { Page } from "../models/page";
import { injectable } from "tsyringe";
import { v4 as uuidv4 } from 'uuid';
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { NotFoundException } from "../../common/exceptions";
import { removeNullProperties } from "../../shared/utils/remove-null-properties";


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
        @Request() request: NRequest,
        @Body() requestBody: {
            page: {
                name: string;
                url: string;
                application_id: string;
                component_ids: string[]
            }
        }): Promise<Page> {
        const { page : {name, url, application_id, component_ids = []} } = requestBody;
        const need_authentification = false;
        const uuid = uuidv4();
        return await this.pageService.create(name, url, application_id, request.user.uuid, uuid, need_authentification, component_ids);
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

    @Put("{uuid}")
    public async update(
        @Path() uuid: string,
        @Body() requestBody: {
           page : any
        }
    ): Promise<Page> {
        const { page } = requestBody;
        let pageToUpdate = await this.pageService.findPageByUUID(uuid);
        if (pageToUpdate! == null) {
          throw new NotFoundException(`Component with uuid ${uuid} not found`);
        }
        pageToUpdate = { ...pageToUpdate, ...page }
        pageToUpdate = removeNullProperties(pageToUpdate);
        return await this.pageService.update(page );
    }

    @Delete("{id}")
    public async delete(
        @Path() id: number
    ): Promise<Page> {
        return await this.pageService.delete(id);
    }





}