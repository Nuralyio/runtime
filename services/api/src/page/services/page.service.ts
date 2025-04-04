import { singleton, inject, delay, container } from "tsyringe";
import { PageRepository } from '../repositories/page.repository';
import { Page } from "../models/page";
import {ApplicationService} from "../../application/services/application.service";
import { ComponentService } from "../../component/services/component.service";
import { NotFoundException } from "../../exceptions/NotFoundException";
@singleton()
export class PageService {

    private pageRepository: PageRepository;
    private applicationService: ApplicationService;
    private componentService: ComponentService;
    constructor(
        pageRepository: PageRepository,
        applicationService: ApplicationService,
        componentService: ComponentService
    ) {
        this.pageRepository = pageRepository;
        this.applicationService = applicationService;
        this.componentService = componentService;

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
    public async deleteApplicationPages(application_id: string): Promise<Page[]> {
        const pages = await this.pageRepository.findPagesByApplicationUUID(application_id);
        const page_ids = pages.map(page => page.uuid);
        return await this.delete(page_ids);
    }
    public async delete(ids: string[]): Promise<Page[]> {
        const deletedPages: Page[] = [];

        for (const id of ids) {
            const page = await this.pageRepository.findPageByUUID(id);
            if (page == null) {
                throw new NotFoundException(`Page with uuid ${id} not found`);
            } else {
                const { component_ids } = page;
                await this.componentService.delete(component_ids);
                const deletedPage = await this.pageRepository.delete(id);
                deletedPages.push(deletedPage);
            }
        }

        return deletedPages;
    }
}