import prisma from '../../../prisma/prisma';
import { singleton } from 'tsyringe';
import { PublishedVersionModel } from '../models/published-version';
import { IPublishedVersionRepository } from '../interfaces/revision.interface';

@singleton()
export class PublishedVersionRepository implements IPublishedVersionRepository {

  public async upsert(published: PublishedVersionModel): Promise<PublishedVersionModel> {
    const upserted = await prisma.publishedVersion.upsert({
      where: { applicationId: published.applicationId },
      update: {
        revision: published.revision,
        publishedBy: published.publishedBy,
        publishedAt: new Date()
      },
      create: {
        applicationId: published.applicationId,
        revision: published.revision,
        publishedBy: published.publishedBy
      }
    });
    return this.toModel(upserted);
  }

  public async findByApplication(applicationId: string): Promise<PublishedVersionModel | null> {
    const found = await prisma.publishedVersion.findUnique({
      where: { applicationId }
    });
    return found ? this.toModel(found) : null;
  }

  public async delete(applicationId: string): Promise<void> {
    await prisma.publishedVersion.delete({
      where: { applicationId }
    });
  }

  private toModel(data: any): PublishedVersionModel {
    const model = new PublishedVersionModel(
      data.applicationId,
      data.revision,
      data.publishedBy
    );
    model.id = data.id;
    model.publishedAt = data.publishedAt;
    return model;
  }
}
