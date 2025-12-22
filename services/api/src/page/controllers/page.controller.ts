import { Body, Controller, Delete, Get, Path, Post, Put, Route, Tags, Request } from "tsoa";
import { PageService } from "../services/page.service";
import { Page } from "../models/page";
import { injectable } from "tsyringe";
import { v4 as uuidv4 } from 'uuid';
import { NRequest } from "../../shared/interfaces/NRequest.interface";
import { removeNullProperties } from "../../shared/utils/remove-null-properties";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { AuthorizationService } from "../../auth/services/authorization.service";

@Route('/api/pages')
@Tags('Pages')
@injectable()
export class PageController extends Controller {
    constructor(
        private readonly pageService: PageService,
        private readonly authorizationService: AuthorizationService
    ) {
        super();
    }

    @Post()
    public async create(
        @Request() request: NRequest,
        @Body() requestBody: {
            page: {
                name: string;
                url: string;
                description: string;
                application_id: string;
                component_ids: string[];
            };
        }
    ): Promise<Page> {
        const { page: { name, url, description, application_id, component_ids = [] } } = requestBody;

        // Check if user has permission to create pages in this application
        await this.authorizationService.requireAppPermission(
            request.user,
            application_id,
            'page:create'
        );

        const need_authentification = false;
        const uuid = uuidv4();
        return await this.pageService.create(
            name,
            url,
            description,
            application_id,
            request.user.uuid,
            uuid,
            need_authentification,
            component_ids
        );
    }

    @Get("{uuid}")
    public async findPageByUUID(
        @Request() request: NRequest,
        @Path() uuid: string
    ): Promise<Page> {
        const page = await this.pageService.findPageByUUID(uuid);

        // Check read permission via application membership or resource permission
        const canRead = await this.authorizationService.canAccess(
            request.user,
            uuid,
            'page',
            'page:read',
            page.application_id
        );

        if (!canRead) {
            this.setStatus(403);
            throw new Error('Access denied: missing read permission');
        }

        return page;
    }

    @Get("application/{uuid}")
    public async findPagesByApplicationUUID(
        @Request() request: NRequest,
        @Path() uuid: string
    ): Promise<Page[]> {
        // Check if user has read permission for this application
        await this.authorizationService.requireAppPermission(
            request.user,
            uuid,
            'page:read'
        );

        return await this.pageService.findPagesByApplicationUUID(uuid);
    }

    @Put("{uuid}")
    public async update(
        @Request() request: NRequest,
        @Path() uuid: string,
        @Body() requestBody: { page: any }
    ): Promise<Page> {
        const { page } = requestBody;
        let pageToUpdate = await this.pageService.findPageByUUID(uuid);

        if (pageToUpdate == null) {
            throw new NotFoundException(`Page with uuid ${uuid} not found`);
        }

        // Check write permission
        await this.authorizationService.requireAppPermission(
            request.user,
            pageToUpdate.application_id,
            'page:write'
        );

        pageToUpdate = { ...pageToUpdate, ...page };
        pageToUpdate = removeNullProperties(pageToUpdate);
        return await this.pageService.update(page);
    }

    @Delete("{id}")
    public async delete(
        @Request() request: NRequest,
        @Path() id: string
    ): Promise<Page> {
        const page = await this.pageService.findPageByUUID(id);

        if (!page) {
            throw new NotFoundException(`Page with uuid ${id} not found`);
        }

        // Check delete permission
        await this.authorizationService.requireAppPermission(
            request.user,
            page.application_id,
            'page:delete'
        );

        return (await this.pageService.delete([id]))[0] ?? null;
    }
}
