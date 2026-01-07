import { singleton, inject, delay } from 'tsyringe';
import { ApplicationVersionRepository } from '../repositories/application-version.repository';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { ComponentVersionRepository } from '../repositories/component-version.repository';
import { ApplicationRevisionRepository } from '../repositories/application-revision.repository';
import { PublishedVersionRepository } from '../repositories/published-version.repository';
import { ApplicationVersionModel } from '../models/application-version';
import { PageVersionModel } from '../models/page-version';
import { ComponentVersionModel } from '../models/component-version';
import { ApplicationRevisionModel, PageRef, ComponentRef } from '../models/application-revision';
import { PublishedVersionModel } from '../models/published-version';
import { RevisionSnapshot, CreateRevisionOptions } from '../interfaces/revision.interface';
import { ApplicationService } from '../../application/services/application.service';
import { PageService } from '../../page/services/page.service';
import { ComponentService } from '../../component/services/component.service';
import { NotFoundException } from '../../exceptions/NotFoundException';

@singleton()
export class RevisionService {
  constructor(
    private appVersionRepo: ApplicationVersionRepository,
    private pageVersionRepo: PageVersionRepository,
    private componentVersionRepo: ComponentVersionRepository,
    private revisionRepo: ApplicationRevisionRepository,
    private publishedVersionRepo: PublishedVersionRepository,
    @inject(delay(() => ApplicationService)) private applicationService: ApplicationService,
    @inject(delay(() => PageService)) private pageService: PageService,
    @inject(delay(() => ComponentService)) private componentService: ComponentService
  ) {}

  /**
   * Create a new application version
   */
  async createApplicationVersion(
    applicationId: string,
    name: string,
    createdBy: string,
    subdomain?: string | null,
    defaultPageId?: string | null
  ): Promise<ApplicationVersionModel> {
    const nextVersion = await this.appVersionRepo.findLatestVersion(applicationId) + 1;
    const version = new ApplicationVersionModel(
      applicationId,
      nextVersion,
      name,
      createdBy,
      subdomain,
      defaultPageId
    );
    return await this.appVersionRepo.create(version);
  }

  /**
   * Create a new page version
   */
  async createPageVersion(
    pageId: string,
    applicationId: string,
    name: string,
    url: string,
    description: string,
    style: any,
    needAuth: boolean,
    componentIds: string[],
    createdBy: string
  ): Promise<PageVersionModel> {
    const nextVersion = await this.pageVersionRepo.findLatestVersion(pageId) + 1;
    const version = new PageVersionModel(
      pageId,
      applicationId,
      nextVersion,
      name,
      url,
      description,
      style,
      needAuth,
      componentIds,
      createdBy
    );
    return await this.pageVersionRepo.create(version);
  }

  /**
   * Create a new component version
   */
  async createComponentVersion(
    componentId: string,
    applicationId: string,
    componentData: any,
    createdBy: string
  ): Promise<ComponentVersionModel> {
    const nextVersion = await this.componentVersionRepo.findLatestVersion(componentId) + 1;
    const version = new ComponentVersionModel(
      componentId,
      applicationId,
      nextVersion,
      componentData,
      createdBy
    );
    return await this.componentVersionRepo.create(version);
  }

  /**
   * Create a new revision (save version) - snapshots current state
   */
  async createRevision(
    applicationId: string,
    createdBy: string,
    options?: CreateRevisionOptions
  ): Promise<ApplicationRevisionModel> {
    // 1. Get current application data and create version
    const app = await this.applicationService.findApplicationById(applicationId);
    const appVersion = await this.createApplicationVersion(
      applicationId,
      app.name,
      createdBy,
      app.subdomain,
      null // defaultPageId - could be added to Application model
    );

    // 2. Get all pages and create versions
    const pages = await this.pageService.findPagesByApplicationUUID(applicationId);
    const pageRefs: PageRef[] = [];
    for (const page of pages) {
      const pageVersion = await this.createPageVersion(
        page.uuid,
        applicationId,
        page.name,
        page.url,
        page.description,
        page.style,
        page.need_authentification,
        page.component_ids,
        createdBy
      );
      pageRefs.push({ pageId: page.uuid, version: pageVersion.version });
    }

    // 3. Get all components and create versions
    const components = await this.componentService.findComponentByApplication(applicationId);
    const componentRefs: ComponentRef[] = [];
    for (const component of components) {
      const componentVersion = await this.createComponentVersion(
        component.uuid,
        applicationId,
        component.component,
        createdBy
      );
      componentRefs.push({ componentId: component.uuid, version: componentVersion.version });
    }

    // 4. Create revision with refs
    const nextRevision = await this.revisionRepo.findLatestRevision(applicationId) + 1;
    const revision = new ApplicationRevisionModel(
      applicationId,
      nextRevision,
      appVersion.version,
      pageRefs,
      componentRefs,
      createdBy,
      options?.versionLabel,
      options?.description
    );

    return await this.revisionRepo.create(revision);
  }

  /**
   * Get a revision by number
   */
  async getRevision(applicationId: string, revision: number): Promise<ApplicationRevisionModel> {
    const rev = await this.revisionRepo.findByRevision(applicationId, revision);
    if (!rev) {
      throw new NotFoundException(`Revision ${revision} not found for application ${applicationId}`);
    }
    return rev;
  }

  /**
   * Get full snapshot data for a revision (for preview/restore)
   */
  async getRevisionSnapshot(applicationId: string, revision: number): Promise<RevisionSnapshot> {
    const rev = await this.getRevision(applicationId, revision);

    // Get app version
    const app = await this.appVersionRepo.findByVersion(applicationId, rev.appVersion);
    if (!app) {
      throw new NotFoundException(`Application version ${rev.appVersion} not found`);
    }

    // Get all page versions
    const pages: PageVersionModel[] = [];
    for (const ref of rev.pageRefs) {
      const pageVersion = await this.pageVersionRepo.findByVersion(ref.pageId, ref.version);
      if (pageVersion) {
        pages.push(pageVersion);
      }
    }

    // Get all component versions
    const components: ComponentVersionModel[] = [];
    for (const ref of rev.componentRefs) {
      const componentVersion = await this.componentVersionRepo.findByVersion(ref.componentId, ref.version);
      if (componentVersion) {
        components.push(componentVersion);
      }
    }

    return { app, pages, components };
  }

  /**
   * List all revisions for an application
   */
  async listRevisions(
    applicationId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ revisions: ApplicationRevisionModel[]; total: number; hasMore: boolean }> {
    const result = await this.revisionRepo.findAllByApplication(applicationId, page, limit);
    const publishedVersion = await this.publishedVersionRepo.findByApplication(applicationId);

    // Mark which revision is published
    const revisions = result.revisions.map(rev => ({
      ...rev,
      isPublished: publishedVersion?.revision === rev.revision
    }));

    return {
      revisions: revisions as any,
      total: result.total,
      hasMore: page * limit < result.total
    };
  }

  /**
   * Publish a specific revision
   */
  async publishRevision(
    applicationId: string,
    revision: number,
    publishedBy: string
  ): Promise<PublishedVersionModel> {
    // Verify revision exists
    await this.getRevision(applicationId, revision);

    // Upsert published version
    const published = new PublishedVersionModel(applicationId, revision, publishedBy);
    const result = await this.publishedVersionRepo.upsert(published);

    // Update application published status
    await this.applicationService.update(true, applicationId);

    return result;
  }

  /**
   * Get published version info
   */
  async getPublishedVersion(applicationId: string): Promise<PublishedVersionModel | null> {
    return await this.publishedVersionRepo.findByApplication(applicationId);
  }

  /**
   * Restore application to a specific revision
   * This creates a new revision after restoring
   */
  async restoreRevision(
    applicationId: string,
    revision: number,
    restoredBy: string,
    description?: string
  ): Promise<ApplicationRevisionModel> {
    // 1. Get the snapshot data from target revision
    const snapshot = await this.getRevisionSnapshot(applicationId, revision);

    // 2. Update live application data
    await this.applicationService.update(
      undefined, // keep published status
      applicationId,
      snapshot.app.name,
      undefined, // keep user_id
      snapshot.app.subdomain
    );

    // 3. Get current live pages and components to delete
    const currentPages = await this.pageService.findPagesByApplicationUUID(applicationId);
    const currentComponents = await this.componentService.findComponentByApplication(applicationId);

    // 4. Delete current components
    if (currentComponents.length > 0) {
      await this.componentService.delete(currentComponents.map(c => c.uuid));
    }

    // 5. Delete current pages (this also deletes components, but we already did that)
    for (const page of currentPages) {
      await this.pageService.delete([page.uuid]);
    }

    // 6. Recreate pages from snapshot
    for (const pageVersion of snapshot.pages) {
      await this.pageService.create(
        pageVersion.name,
        pageVersion.url,
        pageVersion.description,
        applicationId,
        restoredBy,
        pageVersion.pageId, // Keep same UUID
        pageVersion.needAuth,
        pageVersion.componentIds
      );
    }

    // 7. Recreate components from snapshot
    for (const componentVersion of snapshot.components) {
      const componentData = {
        ...componentVersion.componentData,
        uuid: componentVersion.componentId,
        application_id: applicationId
      };
      await this.componentService.create(componentData, restoredBy);
    }

    // 8. Create new revision marking this as a restore
    return await this.createRevision(applicationId, restoredBy, {
      description: description || `Restored from revision ${revision}`,
      versionLabel: undefined
    });
  }

  /**
   * Delete a revision (cannot delete published revision)
   */
  async deleteRevision(applicationId: string, revision: number, userId: string): Promise<void> {
    // Check if this is the published revision
    const published = await this.publishedVersionRepo.findByApplication(applicationId);
    if (published?.revision === revision) {
      throw new Error('Cannot delete the published revision');
    }

    await this.revisionRepo.delete(applicationId, revision);
  }

  /**
   * Get version history for a specific component
   */
  async getComponentVersionHistory(componentId: string): Promise<ComponentVersionModel[]> {
    return await this.componentVersionRepo.findAllByComponent(componentId);
  }

  /**
   * Get version history for a specific page
   */
  async getPageVersionHistory(pageId: string): Promise<PageVersionModel[]> {
    return await this.pageVersionRepo.findAllByPage(pageId);
  }

  /**
   * Get version history for application metadata
   */
  async getApplicationVersionHistory(applicationId: string): Promise<ApplicationVersionModel[]> {
    return await this.appVersionRepo.findAllByApplication(applicationId);
  }
}
