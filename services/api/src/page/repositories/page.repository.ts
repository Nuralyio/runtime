import prisma from '../../../prisma/prisma';
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
                application_id: page.application_id,
                user_id: page.user_id,
                uuid: page.uuid,
                need_authentification: page.need_authentification
            }
        })
    }
    public async findPageByUUID(uuid: string): Promise<Page> {
        const page = await prisma.pages.findFirstOrThrow(
            { where: { uuid } }
        );
        return new Page(
            page.name,
            page.url,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_ids
        ) 
    }

    public async findPagesByApplicationUUID(uuid: string): Promise<Page[]> {
        const pages = await prisma.pages.findMany(
            { where: { application_id : uuid } , orderBy: { id: 'asc' } }
        );
        return pages.reverse().map((page: any) => new Page(
            page.name,
            page.url,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_ids 
        ));
    }


    

    public async findPageByName(name: string): Promise<Page[]> {
        const pages = await prisma.pages.findMany(
            { where: { name } }
        );
        return pages.map((page: any) => new Page(
            page.name,
            page.url,
            page.application_id,
            page.user_id,
            page.uuid,
            page.need_authentification,
            page.component_id
        ));
    }
    public async update( page: Page): Promise<Page> {
        const { name, url, application_id, user_id, uuid, need_authentification, component_ids } = page;

        const updatedPage = await prisma.pages.update({
            where: { uuid },
            data: {
                name,
                url,
                application_id,
                user_id,
                uuid,
                need_authentification,
                component_ids
            }
        });
        return updatedPage;
    }
    public async delete(id: number): Promise<Page> {
        const deletePage = await prisma.pages.delete({
            where: { id }
        });
        const { name, url, application_id, user_id, uuid, need_authentification, component_ids } = deletePage;
        return new Page(
            name,
            url,
            application_id,
            user_id,
            uuid,
            need_authentification,
            component_ids
        );
    }
}