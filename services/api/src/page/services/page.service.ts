import { singleton } from "tsyringe";
import { PageRepository } from '../repositories/page.repository';
import { Page } from "../models/page";
import {ApplicationService} from "../../application/services/application.service";

@singleton()
export class PageService {

    private pageRepository: PageRepository;
    private applicationService: ApplicationService;
    constructor(pageRepository: PageRepository, applicationService: ApplicationService) {
        this.pageRepository = pageRepository;
        this.applicationService = applicationService;
    }
    public async create(name: string, url: string, application_id: string, user_id: string, uuid: string, need_authentification: boolean, component_id: string[]): Promise<Page> {
        const page: Page = new Page(
            name,
            url,
            application_id,
            user_id,
            uuid,
            need_authentification,
            component_id
        );
        return await this.pageRepository.create(page)
    }

    public async findPageByName(name: string): Promise<Page[]> {
        return await this.pageRepository.findPageByName(name);
    }
    public async findPageByUUID(uuid: string): Promise<Page> {

        return await this.pageRepository.findPageByUUID(uuid);
    }

    public async findPagesByApplicationUUID(applicationUUID: string): Promise<Page[]> {
        await this.applicationService.findApplicationById(applicationUUID);
        return await this.pageRepository.findPagesByApplicationUUID(applicationUUID);
    }


    public async update(page: Page): Promise<Page> {
        return await this.pageRepository.update(page);
    }

    public async delete(id: number): Promise<Page> {
        return await this.pageRepository.delete(id);
    }
}