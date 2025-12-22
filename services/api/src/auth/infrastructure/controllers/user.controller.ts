import { UserService } from "../../application/user.service";
import { Controller, Delete, Get, Path, Put, Body, Route, Security, Tags } from "tsoa";
import { UserRepositoryPrismaPgSQL } from "../user.repository";
import { IResponseMessage } from "../../../exceptions/Response.message.interface";

@Route('/api/users')
@Tags('Users')
export class UserController extends Controller {
    private readonly userService: UserService;

    constructor() {
        super();
        const userRepository = new UserRepositoryPrismaPgSQL();
        this.userService = new UserService(userRepository);
    }

    @Get()
    @Security('bearerAuth')
    public async findAll(): Promise<IResponseMessage> {
        return {
            statusCode: 200,
            data: await this.userService.findAll()
        };
    }

    @Get('{id}')
    @Security('bearerAuth')
    public async findById(
        @Path() id: string): Promise<IResponseMessage> {
        return {
            statusCode: 200,
            data: await this.userService.findById(id)
        };
    }

    /**
     * Search for a user by email address
     */
    @Get('search/by-email/{email}')
    @Security('bearerAuth')
    public async findByEmail(
        @Path() email: string): Promise<IResponseMessage> {
        return {
            statusCode: 200,
            data: await this.userService.findUserByEmail(email)
        };
    }

    /**
     * Search for a user by Keycloak ID
     */
    @Get('search/by-keycloak/{keycloakId}')
    @Security('bearerAuth')
    public async findByKeycloakId(
        @Path() keycloakId: string): Promise<IResponseMessage> {
        return {
            statusCode: 200,
            data: await this.userService.findByKeycloakId(keycloakId)
        };
    }

    @Put('{id}')
    @Security('bearerAuth')
    public async update(
        @Path() id: string,
        @Body() requestBody: { email: string, name: string }
    ): Promise<IResponseMessage> {
        const { name, email } = requestBody;
        return {
            statusCode: 200,
            data: await this.userService.update(id, name, email)
        };
    }

    @Delete('{id}')
    @Security('bearerAuth')
    public async delete(
        @Path() id: string
    ): Promise<IResponseMessage> {
        return {
            statusCode: 200,
            message: await this.userService.delete(id),
        };
    }
}
