import prisma from '../../../prisma/prisma';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { IPageRepository } from '../interfaces/page.interface';
import { Page } from '../models/page';
import { singleton } from 'tsyringe';

@singleton()
export class PageRepository implements IPageRepository {

    public async create(page: Page): Promise<Page> {
        return await prisma.pages.create({
            data: {
                name: page.name,
                url: page.url,
                description: page.description,
                application_id: page.application_id,
                user_id: page.user_id,
                uuid: page.uuid,
                need_authentification: page.need_authentification
            }
        })
    }
    public async findPageByUUID(uuid: string): Promise<Page> {
        const page = await prisma.pages.findFirst(
            { where: { uuid } }
        );
        if (!page) {
            throw new NotFoundException(`Page with uuid ${uuid} not found`);
        }
        return new Page(
            page.name,
            page.url,
            page.description,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_ids,
            page.style
        ) 
    }

    public async findPagesByApplicationUUID(uuid: string): Promise<Page[]> {
        const pages = await prisma.pages.findMany(
            { where: { application_id : uuid } , orderBy: { id: 'asc' } }
        );
        return pages.reverse().map((page: any) => new Page(
            page.name,
            page.url,
            page.description,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_ids,
            page.style
        ));
    }

    /**
     * Find a page by URL slug within an application
     * @param applicationId - The application UUID
     * @param url - The page URL slug (e.g., "blog1", "about")
     * @returns Page if found, null otherwise
     */
    public async findPageByUrlInApplication(applicationId: string, url: string): Promise<Page | null> {
        const page = await prisma.pages.findFirst({
            where: {
                application_id: applicationId,
                url: url
            }
        });

        if (!page) {
            return null;
        }

        return new Page(
            page.name,
            page.url,
            page.description,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_ids,
            page.style
        );
    }


    

    public async findPageByName(name: string): Promise<Page[]> {
        const pages = await prisma.pages.findMany(
            { where: { name } }
        );
        return pages.map((page: any) => new Page(
            page.name,
            page.url,
            page.description,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_id
        ));
    }
    public async update( page: Page): Promise<Page> {
        console.log("page", page);
        const { name, url, description,application_id, user_id, uuid, need_authentification, component_ids, style ={} } = page;

        const updatedPage = await prisma.pages.update({
            where: { uuid },
            data: {
                name,
                url,
                description,
                application_id,
                user_id,
                uuid,
                need_authentification,
                component_ids,
                style
            }
        });
        return updatedPage;
    }
    public async delete(page_uuid: string): Promise<Page> {

        const deletePage = await prisma.pages.delete({
            where: { uuid: page_uuid }
        });
        // this
        const { name, url, description,application_id, user_id, uuid, need_authentification, component_ids } = deletePage;
        return new Page(
            name,
            url,
            description,
            application_id,
            user_id,
            uuid,
            need_authentification,
            component_ids
        );
    }
}