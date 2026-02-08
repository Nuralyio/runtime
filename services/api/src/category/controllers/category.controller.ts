import { Body, Controller, Delete, Get, Path, Post, Put, Query, Route, Tags, Request } from 'tsoa';
import { injectable } from 'tsyringe';
import { CategoryService } from '../services/category.service';
import { AuthorizationService } from '../../auth/services/authorization.service';
import { NRequest } from '../../shared/interfaces/NRequest.interface';
import { Category, CategoryResource } from '../models/category';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    AssignResourceDto,
    BulkAssignResourcesDto,
    MoveCategoryDto,
} from '../interfaces/category.interface';

@Route('/api/categories')
@Tags('Categories')
@injectable()
export class CategoryController extends Controller {

    constructor(
        private readonly categoryService: CategoryService,
        private readonly authorizationService: AuthorizationService
    ) {
        super();
    }

    @Post()
    public async create(
        @Request() request: NRequest,
        @Body() body: CreateCategoryDto
    ): Promise<Category> {
        await this.authorizationService.requireAppPermission(
            request.user,
            body.applicationId,
            'category:write'
        );
        return await this.categoryService.create(body, request.user.uuid);
    }

    @Get()
    public async findByApplication(
        @Request() request: NRequest,
        @Query() applicationId: string,
        @Query() resourceType?: string
    ): Promise<Category[]> {
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:read'
        );
        return await this.categoryService.findByApplication(applicationId, resourceType);
    }

    @Get('{uuid}')
    public async findByUuid(
        @Request() request: NRequest,
        @Path() uuid: string
    ): Promise<Category> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:read'
        );
        return await this.categoryService.findByUuid(uuid);
    }

    @Get('{uuid}/tree')
    public async getTree(
        @Request() request: NRequest,
        @Path() uuid: string
    ): Promise<Category> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:read'
        );
        return await this.categoryService.getTree(uuid);
    }

    @Put('{uuid}')
    public async update(
        @Request() request: NRequest,
        @Path() uuid: string,
        @Body() body: UpdateCategoryDto
    ): Promise<Category> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:write'
        );
        return await this.categoryService.update(uuid, body);
    }

    @Delete('{uuid}')
    public async delete(
        @Request() request: NRequest,
        @Path() uuid: string
    ): Promise<Category> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:delete'
        );
        return await this.categoryService.delete(uuid);
    }

    @Post('{uuid}/move')
    public async moveCategory(
        @Request() request: NRequest,
        @Path() uuid: string,
        @Body() body: MoveCategoryDto
    ): Promise<Category> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:write'
        );
        return await this.categoryService.moveCategory(uuid, body.parentUuid);
    }

    @Get('{uuid}/resources')
    public async getResources(
        @Request() request: NRequest,
        @Path() uuid: string
    ): Promise<CategoryResource[]> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:read'
        );
        return await this.categoryService.getResources(uuid);
    }

    @Post('{uuid}/resources')
    public async assignResource(
        @Request() request: NRequest,
        @Path() uuid: string,
        @Body() body: AssignResourceDto
    ): Promise<CategoryResource> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:write'
        );
        return await this.categoryService.assignResource(uuid, body.resourceId, body.resourceType);
    }

    @Post('{uuid}/resources/bulk')
    public async bulkAssignResources(
        @Request() request: NRequest,
        @Path() uuid: string,
        @Body() body: BulkAssignResourcesDto
    ): Promise<CategoryResource[]> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:write'
        );
        return await this.categoryService.bulkAssignResources(uuid, body.resources);
    }

    @Delete('{uuid}/resources/{resourceId}')
    public async removeResource(
        @Request() request: NRequest,
        @Path() uuid: string,
        @Path() resourceId: string,
        @Query() resourceType: string
    ): Promise<void> {
        const applicationId = await this.categoryService.getApplicationId(uuid);
        await this.authorizationService.requireAppPermission(
            request.user,
            applicationId,
            'category:write'
        );
        await this.categoryService.removeResource(resourceId, resourceType);
    }

    @Get('resource/{resourceType}/{resourceId}')
    public async findCategoryByResource(
        @Request() request: NRequest,
        @Path() resourceType: string,
        @Path() resourceId: string
    ): Promise<Category> {
        const category = await this.categoryService.findCategoryByResource(resourceId, resourceType);
        await this.authorizationService.requireAppPermission(
            request.user,
            category.applicationId,
            'category:read'
        );
        return category;
    }
}
