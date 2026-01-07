import prisma from '../../../prisma/prisma';
import { singleton } from 'tsyringe';
import { ComponentVersionModel } from '../models/component-version';
import { IComponentVersionRepository } from '../interfaces/revision.interface';

@singleton()
export class ComponentVersionRepository implements IComponentVersionRepository {

  public async create(version: ComponentVersionModel): Promise<ComponentVersionModel> {
    const created = await prisma.componentVersion.create({
      data: {
        componentId: version.componentId,
        applicationId: version.applicationId,
        version: version.version,
        componentData: version.componentData,
        createdBy: version.createdBy
      }
    });
    return this.toModel(created);
  }

  public async findByVersion(componentId: string, version: number): Promise<ComponentVersionModel | null> {
    const found = await prisma.componentVersion.findUnique({
      where: {
        componentId_version: { componentId, version }
      }
    });
    return found ? this.toModel(found) : null;
  }

  public async findLatestVersion(componentId: string): Promise<number> {
    const result = await prisma.componentVersion.findFirst({
      where: { componentId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
    return result?.version ?? 0;
  }

  public async findAllByComponent(componentId: string): Promise<ComponentVersionModel[]> {
    const versions = await prisma.componentVersion.findMany({
      where: { componentId },
      orderBy: { version: 'desc' }
    });
    return versions.map(v => this.toModel(v));
  }

  public async findAllByApplication(applicationId: string): Promise<ComponentVersionModel[]> {
    const versions = await prisma.componentVersion.findMany({
      where: { applicationId },
      orderBy: { version: 'desc' }
    });
    return versions.map(v => this.toModel(v));
  }

  private toModel(data: any): ComponentVersionModel {
    const model = new ComponentVersionModel(
      data.componentId,
      data.applicationId,
      data.version,
      data.componentData,
      data.createdBy
    );
    model.id = data.id;
    model.createdAt = data.createdAt;
    return model;
  }
}
