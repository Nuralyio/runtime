import { ApplicationVersionModel } from '../models/application-version';
import { PageVersionModel } from '../models/page-version';
import { ComponentVersionModel } from '../models/component-version';
import { ApplicationRevisionModel, PageRef, ComponentRef } from '../models/application-revision';
import { PublishedVersionModel } from '../models/published-version';

export interface IApplicationVersionRepository {
  create(version: ApplicationVersionModel): Promise<ApplicationVersionModel>;
  findByVersion(applicationId: string, version: number): Promise<ApplicationVersionModel | null>;
  findLatestVersion(applicationId: string): Promise<number>;
  findAllByApplication(applicationId: string): Promise<ApplicationVersionModel[]>;
}

export interface IPageVersionRepository {
  create(version: PageVersionModel): Promise<PageVersionModel>;
  findByVersion(pageId: string, version: number): Promise<PageVersionModel | null>;
  findLatestVersion(pageId: string): Promise<number>;
  findAllByPage(pageId: string): Promise<PageVersionModel[]>;
  findAllByApplication(applicationId: string): Promise<PageVersionModel[]>;
}

export interface IComponentVersionRepository {
  create(version: ComponentVersionModel): Promise<ComponentVersionModel>;
  findByVersion(componentId: string, version: number): Promise<ComponentVersionModel | null>;
  findLatestVersion(componentId: string): Promise<number>;
  findAllByComponent(componentId: string): Promise<ComponentVersionModel[]>;
  findAllByApplication(applicationId: string): Promise<ComponentVersionModel[]>;
}

export interface IApplicationRevisionRepository {
  create(revision: ApplicationRevisionModel): Promise<ApplicationRevisionModel>;
  findByRevision(applicationId: string, revision: number): Promise<ApplicationRevisionModel | null>;
  findLatestRevision(applicationId: string): Promise<number>;
  findAllByApplication(applicationId: string, page?: number, limit?: number): Promise<{ revisions: ApplicationRevisionModel[]; total: number }>;
  delete(applicationId: string, revision: number): Promise<void>;
}

export interface IPublishedVersionRepository {
  upsert(published: PublishedVersionModel): Promise<PublishedVersionModel>;
  findByApplication(applicationId: string): Promise<PublishedVersionModel | null>;
  delete(applicationId: string): Promise<void>;
}

export interface RevisionSnapshot {
  app: ApplicationVersionModel;
  pages: PageVersionModel[];
  components: ComponentVersionModel[];
}

export interface CreateRevisionOptions {
  versionLabel?: string;
  description?: string;
}
