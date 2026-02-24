import { Page } from "../models/page";

export interface IPageRepository {
    create(page: Page): Promise<Page>;
    findPageByName(name: string): Promise<Page[]>;
    findPageByUUID(uuid: string): Promise<Page>;
    findPagesByApplicationUUID(uuid: string): Promise<Page[]>;
    findPageByUrlInApplication(applicationId: string, url: string): Promise<Page | null>;
    update( Page: Page): Promise<Page>;
    delete(id: string): Promise<Page>;

}