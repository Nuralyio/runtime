import { UserService } from "../../application/user.service";
import { Body, Controller, Delete, Get, Path, Post, Put, Route, Security, Tags } from "tsoa";
import { UserRepositoryPrismaPgSQL } from "../user.repository";
import { IResponseMessage } from "../../../common/response.message.interface";

@Route('/api/users')
@Tags('Users')
export class UserController extends Controller {
    private readonly userService: UserService;

    constructor() {
        super();
        const userRepository = new UserRepositoryPrismaPgSQL();
        this.userService = new UserService(userRepository);
    }

    @Post()
    @Security('bearerAuth')
    public async create(
        @Body() requestBody: { password: string, email: string, name: string }): Promise<IResponseMessage> {
        const { name, email, password } = requestBody;
        return {
            statusCode: 200,
            data: await this.userService.create(name, email, password)
        };
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
