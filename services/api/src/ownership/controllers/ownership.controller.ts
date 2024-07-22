import { OwnershipService } from "../services/ownership.service";
import { Body, Controller, Delete, Get, Hidden, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { Ownership } from "../models/ownership";
import { OwnershipRepository } from "../repositories/ownership.repository";


@Route('/api/ownership-check')
@Tags('Ownerships')
export class OwnershipController extends Controller {
    private readonly ownershipService: OwnershipService;

    constructor() {
        super();
        const ownershipRepository = new OwnershipRepository();
        this.ownershipService = new OwnershipService(ownershipRepository);
    }

    @Get('/me/{resourceId}/{resourceType}')
    public async getOwnershipByResource(
        @Path() resourceId: string, resourceType: string
    ): Promise<Ownership> {
        return await this.ownershipService.getOwnershipByResource(resourceId, resourceType);
    }

    @Get('{user_uuid}/{resourceId}/{resourceType}')
    public async getOwnershipByUser(
        @Path() user_uuid: string, resourceId: string, resourceType: string
    ): Promise<Ownership> {
        return await this.ownershipService.getOwnershipByUser(user_uuid, resourceId, resourceType);
    }

    @Post()
    public async create(
        @Body() requestBody: { resourceType: string, resourceId: string, ownerId: string }): Promise<Ownership> {
        const { resourceType, resourceId, ownerId } = requestBody;
        return await this.ownershipService.create(resourceType, resourceId, ownerId);
    }

    @Delete("{id}")
    public async delete(
        @Path() id: number
    ): Promise<Ownership> {
        return await this.ownershipService.delete(id);
    }


}
