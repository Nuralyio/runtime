import { application } from 'express';
import prisma from '../../../prisma/prisma'
import { IApplicationRepository } from '../interfaces/application.interface';
import { Application } from '../models/application';

export class ApplicationRepositoryPrismaPgSQL implements IApplicationRepository {

  public async create(application: Application): Promise<Application> {
    return await prisma.applications.create({
      data: {
        published:application.published,
        user_id: application.user_id,
        name: application.name,
        uuid: application.uuid
      }
    })
  }

  public async findAll(): Promise<Application[]> {
    const applications = await prisma.applications.findMany();
    return applications.map((application) => new Application(application.published ?? false, application.name, application.uuid, application.user_id));
  }
  
  public async findApplicationById(uuid: string): Promise<Application> {
    const application = await prisma.applications.findFirst({
      where: { uuid }
    });
    return new Application(application!.published ?? false, application!.name, application!.uuid, application!.user_id);
  }

  public async update(uuid: string, application: Application): Promise<Application> {
    const updatedApplication = await prisma.applications.update({
      where: { uuid },
      data: {
        published :application.published,
        name: application.name,
        user_id: application.user_id
      }
    });
    return new Application(updatedApplication.published ?? false,updatedApplication.name, updatedApplication.uuid, updatedApplication.user_id);
  }

  public async delete(uuid: string ): Promise<Application> {
    const deleteApplication = await prisma.applications.delete({
      where: { uuid }
    });
    return new Application(deleteApplication.published ?? false,deleteApplication.name, deleteApplication.uuid, deleteApplication.user_id);
  }

  
}