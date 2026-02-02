import prisma from '../../../prisma/prisma'
import { Prisma } from '@prisma/client'
import { IApplicationRepository } from '../interfaces/application.interface';
import { Application, AppI18nConfig } from '../models/application';
import { singleton } from 'tsyringe';
import {ApplicationNotFound} from "../../exceptions/ApplicationNotFound";

@singleton()
export class ApplicationRepository implements IApplicationRepository {

  public async create(application: Application): Promise<Application> {
    const created = await prisma.applications.create({
      data: {
        published: application.published,
        user_id: application.user_id,
        name: application.name,
        uuid: application.uuid,
        subdomain: application.subdomain,
        i18n: application.i18n as any
      }
    });
    return new Application(
      created.published ?? false,
      created.name,
      created.uuid,
      created.user_id,
      created.subdomain,
      created.requiresAuthOnly,
      created.i18n as AppI18nConfig | null
    );
  }

  public async findAll(applicationIds : string[]): Promise<Application[]> {
    // Use raw query to join applications with published_versions in one query
    const applications = await prisma.$queryRaw<Array<{
      id: number;
      name: string;
      published: boolean | null;
      uuid: string;
      user_id: string;
      subdomain: string | null;
      requires_auth_only: boolean;
      i18n: any;
      published_at: Date | null;
    }>>`
      SELECT a.*, pv.published_at
      FROM applications a
      LEFT JOIN published_versions pv ON a.uuid = pv.application_id
      WHERE a.uuid IN (${Prisma.join(applicationIds)})
    `;

    return applications.map((application) => new Application(
      application.published ?? false,
      application.name,
      application.uuid,
      application.user_id,
      application.subdomain,
      application.requires_auth_only,
      application.i18n as AppI18nConfig | null,
      application.published_at ?? null
    ));
  }

  public async findApplicationById(uuid: string): Promise<Application> {
    const application = await prisma.applications.findFirst({
      where: { uuid }
    });
    if(!application) {
      throw new ApplicationNotFound("Application not found");
    }
    return new Application(
      application.published ?? false,
      application.name,
      application.uuid,
      application.user_id,
      application.subdomain,
      application.requiresAuthOnly,
      application.i18n as AppI18nConfig | null
    );
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
    return new Application(
      application.published ?? false,
      application.name,
      application.uuid,
      application.user_id,
      application.subdomain,
      application.requiresAuthOnly,
      application.i18n as AppI18nConfig | null
    );
  }

  public async update(uuid: string, application: Application): Promise<Application> {
    const updatedApplication = await prisma.applications.update({
      where: { uuid },
      data: {
        published: application.published,
        name: application.name,
        user_id: application.user_id,
        subdomain: application.subdomain,
        requiresAuthOnly: application.requiresAuthOnly,
        i18n: application.i18n as any
      }
    });
    return new Application(
      updatedApplication.published ?? false,
      updatedApplication.name,
      updatedApplication.uuid,
      updatedApplication.user_id,
      updatedApplication.subdomain,
      updatedApplication.requiresAuthOnly,
      updatedApplication.i18n as AppI18nConfig | null
    );
  }

  public async delete(uuid: string ): Promise<Application> {
    const deleteApplication = await prisma.applications.delete({
      where: { uuid }
    });
    return new Application(
      deleteApplication.published ?? false,
      deleteApplication.name,
      deleteApplication.uuid,
      deleteApplication.user_id,
      deleteApplication.subdomain,
      deleteApplication.requiresAuthOnly,
      deleteApplication.i18n as AppI18nConfig | null
    );
  }


}