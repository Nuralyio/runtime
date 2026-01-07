import prisma from '../../../prisma/prisma';
import { singleton } from 'tsyringe';
import { ApplicationVersionModel } from '../models/application-version';
import { IApplicationVersionRepository } from '../interfaces/revision.interface';

@singleton()
export class ApplicationVersionRepository implements IApplicationVersionRepository {

  public async create(version: ApplicationVersionModel): Promise<ApplicationVersionModel> {
    const created = await prisma.applicationVersion.create({
      data: {
        applicationId: version.applicationId,
        version: version.version,
        name: version.name,
        subdomain: version.subdomain,
        defaultPageId: version.defaultPageId,
        createdBy: version.createdBy
      }
    });
    return this.toModel(created);
  }

  public async findByVersion(applicationId: string, version: number): Promise<ApplicationVersionModel | null> {
    const found = await prisma.applicationVersion.findUnique({
      where: {
        applicationId_version: { applicationId, version }
      }
    });
    return found ? this.toModel(found) : null;
  }

  public async findLatestVersion(applicationId: string): Promise<number> {
    const result = await prisma.applicationVersion.findFirst({
      where: { applicationId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
    return result?.version ?? 0;
  }

  public async findAllByApplication(applicationId: string): Promise<ApplicationVersionModel[]> {
    const versions = await prisma.applicationVersion.findMany({
      where: { applicationId },
      orderBy: { version: 'desc' }
    });
    return versions.map(v => this.toModel(v));
  }

  private toModel(data: any): ApplicationVersionModel {
    const model = new ApplicationVersionModel(
      data.applicationId,
      data.version,
      data.name,
      data.createdBy,
      data.subdomain,
      data.defaultPageId
    );
    model.id = data.id;
    model.createdAt = data.createdAt;
    return model;
  }
}
