import prisma from '../../../prisma/prisma';
import { singleton } from 'tsyringe';
import { ApplicationRevisionModel, PageRef, ComponentRef } from '../models/application-revision';
import { IApplicationRevisionRepository } from '../interfaces/revision.interface';

@singleton()
export class ApplicationRevisionRepository implements IApplicationRevisionRepository {

  public async create(revision: ApplicationRevisionModel): Promise<ApplicationRevisionModel> {
    const created = await prisma.applicationRevision.create({
      data: {
        applicationId: revision.applicationId,
        revision: revision.revision,
        versionLabel: revision.versionLabel,
        description: revision.description,
        appVersion: revision.appVersion,
        pageRefs: revision.pageRefs as any,
        componentRefs: revision.componentRefs as any,
        createdBy: revision.createdBy
      }
    });
    return this.toModel(created);
  }

  public async findByRevision(applicationId: string, revision: number): Promise<ApplicationRevisionModel | null> {
    const found = await prisma.applicationRevision.findUnique({
      where: {
        applicationId_revision: { applicationId, revision }
      }
    });
    return found ? this.toModel(found) : null;
  }

  public async findLatestRevision(applicationId: string): Promise<number> {
    const result = await prisma.applicationRevision.findFirst({
      where: { applicationId },
      orderBy: { revision: 'desc' },
      select: { revision: true }
    });
    return result?.revision ?? 0;
  }

  public async findAllByApplication(
    applicationId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ revisions: ApplicationRevisionModel[]; total: number }> {
    const [revisions, total] = await Promise.all([
      prisma.applicationRevision.findMany({
        where: { applicationId },
        orderBy: { revision: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.applicationRevision.count({
        where: { applicationId }
      })
    ]);
    return {
      revisions: revisions.map(r => this.toModel(r)),
      total
    };
  }

  public async delete(applicationId: string, revision: number): Promise<void> {
    await prisma.applicationRevision.delete({
      where: {
        applicationId_revision: { applicationId, revision }
      }
    });
  }

  private toModel(data: any): ApplicationRevisionModel {
    const model = new ApplicationRevisionModel(
      data.applicationId,
      data.revision,
      data.appVersion,
      data.pageRefs as PageRef[],
      data.componentRefs as ComponentRef[],
      data.createdBy,
      data.versionLabel,
      data.description
    );
    model.id = data.id;
    model.createdAt = data.createdAt;
    return model;
  }
}
