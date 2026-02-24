import prisma from '../../../prisma/prisma';
import { singleton } from 'tsyringe';
import { PageVersionModel } from '../models/page-version';
import { IPageVersionRepository } from '../interfaces/revision.interface';

@singleton()
export class PageVersionRepository implements IPageVersionRepository {

  public async create(version: PageVersionModel): Promise<PageVersionModel> {
    const created = await prisma.pageVersion.create({
      data: {
        pageId: version.pageId,
        applicationId: version.applicationId,
        version: version.version,
        name: version.name,
        url: version.url,
        description: version.description,
        style: version.style,
        needAuth: version.needAuth,
        componentIds: version.componentIds,
        createdBy: version.createdBy
      }
    });
    return this.toModel(created);
  }

  public async findByVersion(pageId: string, version: number): Promise<PageVersionModel | null> {
    const found = await prisma.pageVersion.findUnique({
      where: {
        pageId_version: { pageId, version }
      }
    });
    return found ? this.toModel(found) : null;
  }

  public async findLatestVersion(pageId: string): Promise<number> {
    const result = await prisma.pageVersion.findFirst({
      where: { pageId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
    return result?.version ?? 0;
  }

  public async findAllByPage(pageId: string): Promise<PageVersionModel[]> {
    const versions = await prisma.pageVersion.findMany({
      where: { pageId },
      orderBy: { version: 'desc' }
    });
    return versions.map(v => this.toModel(v));
  }

  public async findAllByApplication(applicationId: string): Promise<PageVersionModel[]> {
    const versions = await prisma.pageVersion.findMany({
      where: { applicationId },
      orderBy: { version: 'desc' }
    });
    return versions.map(v => this.toModel(v));
  }

  private toModel(data: any): PageVersionModel {
    const model = new PageVersionModel(
      data.pageId,
      data.applicationId,
      data.version,
      data.name,
      data.url,
      data.description,
      data.style,
      data.needAuth,
      data.componentIds,
      data.createdBy
    );
    model.id = data.id;
    model.createdAt = data.createdAt;
    return model;
  }
}
