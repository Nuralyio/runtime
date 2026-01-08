import { singleton, inject, delay } from "tsyringe";
import { PageRepository } from '../repositories/page.repository';
import { Page } from "../models/page";
import { ApplicationService } from "../../application/services/application.service";
import { ComponentService } from "../../component/services/component.service";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { RevisionService } from "../../revision/services/revision.service";

@singleton()
export class PageService {

    constructor(
        private pageRepository: PageRepository,
        @inject(delay(() => ApplicationService)) private applicationService: ApplicationService,
        @inject(delay(() => ComponentService)) private componentService: ComponentService,
        @inject(delay(() => RevisionService)) private revisionService: RevisionService
    ) {}

    public async create(name: string, url: string, description: string, application_id: string, user_id: string, uuid: string, need_authentification: boolean, component_id: string[]): Promise<Page> {
        const page: Page = new Page(
            name,
            url,
            description,
            application_id,
            user_id,
            uuid,
            need_authentification,
            component_id
        );
        const created = await this.pageRepository.create(page);

        // Auto-create page version on create
        this.autoCreatePageVersion(created, user_id);

        return created;
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

    public async update(page: Page, userId?: string): Promise<Page> {
        const updated = await this.pageRepository.update(page);

        // Auto-create page version on update
        if (userId) {
            this.autoCreatePageVersion(updated, userId);
        }

        return updated;
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

    /**
     * Auto-create a page version (non-blocking)
     * This tracks the individual page change, NOT a full application snapshot
     */
    private autoCreatePageVersion(page: Page, userId: string): void {
        // Run async without blocking the main operation
        this.revisionService.createPageVersion(
            page.uuid,
            page.application_id,
            page.name,
            page.url,
            page.description,
            page.style,
            page.need_authentification,
            page.component_ids,
            userId
        ).catch(err => console.error('Auto-version failed:', err));
    }
}
