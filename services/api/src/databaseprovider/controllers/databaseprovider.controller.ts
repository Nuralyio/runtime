import { DatabaseproviderService } from "../services/databaseprovider.service";
import { Body, Controller, Delete, Get, Hidden, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { Databaseprovider } from "../models/databaseprovider";
import { DatabaseproviderRepositoryPrismaPgSQL } from "../repositories/databaseprovider.repository";

@Route('/api/databaseproviders')
@Tags('Databaseproviders')
export class DatabaseproviderController extends Controller {
    private readonly databaseproviderService: DatabaseproviderService;

    constructor() {
        super();
        const databaseproviderRepository = new DatabaseproviderRepositoryPrismaPgSQL();
        this.databaseproviderService = new DatabaseproviderService(databaseproviderRepository);
    }

    @Post()
    public async create(
        @Body() requestBody: { username: string, host: string, password: string, port: number, databasename: string, provider_type: string, user_id: string, label: string }): Promise<Databaseprovider> {
        const { username, host, password, port, databasename, provider_type, user_id, label } = requestBody;
        return await this.databaseproviderService.create(username, host, password, port, databasename, provider_type, user_id, label);
    }

    @Get()
    public async findAll(): Promise<Databaseprovider[]> {
        return await this.databaseproviderService.findAll();
    }

    @Get("{databasename}")
    public async findDatabaseproviderByDatabasename(
        @Path() databasename: string
    ): Promise<Databaseprovider> {
        return await this.databaseproviderService.findDatabaseproviderByDatabasename(databasename);
    }

    @Get("{provider_type}")
    public async findDatabaseproviderByProvidertype(
        @Path() provider_type: string
    ): Promise<Databaseprovider> {
        return await this.databaseproviderService.findDatabaseproviderByProvidertype(provider_type);
    }

    @Put("{provider_id}")
    public async update(
        @Path() provider_id: number,
        @Body() requestBody: { username: string, host: string, password: string, port: number, databasename: string, provider_type: string, user_id: string, label: string }
    ): Promise<Databaseprovider> {
        const { username, host, password, port, databasename, provider_type, user_id, label } = requestBody;
        return await this.databaseproviderService.update(provider_id, username, host, password, port, databasename, provider_type, user_id, label);
    }

    @Delete("{provider_id}")
    public async delete(
        @Path() provider_id: number
    ): Promise<Databaseprovider> {
        return await this.databaseproviderService.delete(provider_id);
    }


}
