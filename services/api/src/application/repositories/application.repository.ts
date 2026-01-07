import prisma from '../../../prisma/prisma'
import { IApplicationRepository } from '../interfaces/application.interface';
import { Application } from '../models/application';
import { singleton } from 'tsyringe';
import {ApplicationNotFound} from "../../exceptions/ApplicationNotFound";

@singleton()
export class ApplicationRepository implements IApplicationRepository {

  public async create(application: Application): Promise<Application> {
    return await prisma.applications.create({
      data: {
        published: application.published,
        user_id: application.user_id,
        name: application.name,
        uuid: application.uuid,
        subdomain: application.subdomain
      }
    })
  }

  public async findAll(applicationIds : string[]): Promise<Application[]> {
    const applications = await prisma.applications.findMany(
      { where: { uuid :{
        in: applicationIds
      } } }
    );
    return applications.map((application) => new Application(application.published ?? false, application.name, application.uuid, application.user_id, application.subdomain, application.requiresAuthOnly));
  }

  public async findApplicationById(uuid: string): Promise<Application> {
    const application = await prisma.applications.findFirst({
      where: { uuid }
    });
    if(!application) {
      throw new ApplicationNotFound("Application not found");
    }
    return new Application(application.published ?? false, application.name, application.uuid, application.user_id, application.subdomain, application.requiresAuthOnly);
  }

  /**
   * Find an application by its subdomain
   * @param subdomain - The subdomain to search for (e.g., "myapp" for myapp.domain.com)
   * @returns Application if found, null otherwise
   */
  public async findApplicationBySubdomain(subdomain: string): Promise<Application | null> {
    const application = await prisma.applications.findFirst({
      where: { subdomain }
    });
    if (!application) {
      return null;
    }
    return new Application(application.published ?? false, application.name, application.uuid, application.user_id, application.subdomain, application.requiresAuthOnly);
  }

  public async update(uuid: string, application: Application): Promise<Application> {
    const updatedApplication = await prisma.applications.update({
      where: { uuid },
      data: {
        published: application.published,
        name: application.name,
        user_id: application.user_id,
        subdomain: application.subdomain,
        requiresAuthOnly: application.requiresAuthOnly
      }
    });
    return new Application(updatedApplication.published ?? false, updatedApplication.name, updatedApplication.uuid, updatedApplication.user_id, updatedApplication.subdomain, updatedApplication.requiresAuthOnly);
  }

  public async delete(uuid: string ): Promise<Application> {
    const deleteApplication = await prisma.applications.delete({
      where: { uuid }
    });
    return new Application(deleteApplication.published ?? false, deleteApplication.name, deleteApplication.uuid, deleteApplication.user_id, deleteApplication.subdomain, deleteApplication.requiresAuthOnly);
  }


}