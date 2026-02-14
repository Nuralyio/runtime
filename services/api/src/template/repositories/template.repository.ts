import { singleton } from 'tsyringe';
import prisma from '../../../prisma/prisma';
import { AppTemplate, TemplateSnapshot } from '../models/template';
import { NotFoundException } from '../../exceptions/NotFoundException';

@singleton()
export class TemplateRepository {

  public async create(template: AppTemplate): Promise<AppTemplate> {
    const created = await prisma.appTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
        public: template.public,
        verified: template.verified,
        sourceAppId: template.sourceAppId,
        createdBy: template.createdBy,
        snapshot: template.snapshot as any,
      },
    });
    return this.mapToModel(created);
  }

  public async findAll(userId: string): Promise<AppTemplate[]> {
    const templates = await prisma.appTemplate.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { public: true },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return templates.map(t => this.mapToModel(t));
  }

  public async findById(id: string): Promise<AppTemplate> {
    const template = await prisma.appTemplate.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }
    return this.mapToModel(template);
  }

  public async update(id: string, data: Partial<Pick<AppTemplate, 'name' | 'description' | 'category' | 'thumbnail' | 'public' | 'verified'>>): Promise<AppTemplate> {
    const updated = await prisma.appTemplate.update({
      where: { id },
      data,
    });
    return this.mapToModel(updated);
  }

  public async delete(id: string): Promise<AppTemplate> {
    const deleted = await prisma.appTemplate.delete({
      where: { id },
    });
    return this.mapToModel(deleted);
  }

  private mapToModel(data: any): AppTemplate {
    return new AppTemplate(
      data.name,
      data.description,
      data.category,
      data.sourceAppId,
      data.createdBy,
      data.snapshot as TemplateSnapshot,
      data.public,
      data.verified,
      data.thumbnail,
      data.id,
      data.createdAt,
      data.updatedAt
    );
  }
}
