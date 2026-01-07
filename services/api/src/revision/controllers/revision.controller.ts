import { Body, Controller, Delete, Get, Path, Post, Query, Route, Tags, Request } from 'tsoa';
import { injectable } from 'tsyringe';
import { RevisionService } from '../services/revision.service';
import { AuthorizationService } from '../../auth/services/authorization.service';
import { NRequest } from '../../shared/interfaces/NRequest.interface';
import { ApplicationRevisionModel } from '../models/application-revision';
import { PublishedVersionModel } from '../models/published-version';
import { RevisionSnapshot } from '../interfaces/revision.interface';
import { ApplicationVersionModel } from '../models/application-version';
import { PageVersionModel } from '../models/page-version';
import { ComponentVersionModel } from '../models/component-version';

interface CreateRevisionBody {
  versionLabel?: string;
  description?: string;
}

interface RestoreRevisionBody {
  description?: string;
}

interface ListRevisionsResponse {
  revisions: ApplicationRevisionModel[];
  total: number;
  hasMore: boolean;
}

@Route('/api/applications/{applicationUuid}/revisions')
@Tags('Revisions')
@injectable()
export class RevisionController extends Controller {
  constructor(
    private revisionService: RevisionService,
    private authorizationService: AuthorizationService
  ) {
    super();
  }

  /**
   * Create a new revision (save version)
   */
  @Post()
  async createRevision(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Body() body: CreateRevisionBody
  ): Promise<ApplicationRevisionModel> {
    // Check write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationUuid,
      'application:write'
    );

    return await this.revisionService.createRevision(
      applicationUuid,
      request.user.uuid,
      {
        versionLabel: body.versionLabel,
        description: body.description
      }
    );
  }

  /**
   * List all revisions for an application
   */
  @Get()
  async listRevisions(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Query() page?: number,
    @Query() limit?: number
  ): Promise<ListRevisionsResponse> {
    // Check read permission
    const canRead = await this.authorizationService.canAccess(
      request.user,
      applicationUuid,
      'application',
      'application:read',
      applicationUuid
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return await this.revisionService.listRevisions(
      applicationUuid,
      page ?? 1,
      limit ?? 20
    );
  }

  /**
   * Get a specific revision
   */
  @Get('{revision}')
  async getRevision(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Path() revision: number
  ): Promise<ApplicationRevisionModel> {
    // Check read permission
    const canRead = await this.authorizationService.canAccess(
      request.user,
      applicationUuid,
      'application',
      'application:read',
      applicationUuid
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return await this.revisionService.getRevision(applicationUuid, revision);
  }

  /**
   * Get full snapshot data for a revision (for preview)
   */
  @Get('{revision}/preview')
  async getRevisionPreview(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Path() revision: number
  ): Promise<RevisionSnapshot> {
    // Check read permission
    const canRead = await this.authorizationService.canAccess(
      request.user,
      applicationUuid,
      'application',
      'application:read',
      applicationUuid
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return await this.revisionService.getRevisionSnapshot(applicationUuid, revision);
  }

  /**
   * Get currently published revision
   */
  @Get('published')
  async getPublishedRevision(
    @Request() request: NRequest,
    @Path() applicationUuid: string
  ): Promise<PublishedVersionModel | null> {
    // Check read permission
    const canRead = await this.authorizationService.canAccess(
      request.user,
      applicationUuid,
      'application',
      'application:read',
      applicationUuid
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return await this.revisionService.getPublishedVersion(applicationUuid);
  }

  /**
   * Publish a specific revision
   */
  @Post('{revision}/publish')
  async publishRevision(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Path() revision: number
  ): Promise<PublishedVersionModel> {
    // Check write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationUuid,
      'application:write'
    );

    return await this.revisionService.publishRevision(
      applicationUuid,
      revision,
      request.user.uuid
    );
  }

  /**
   * Restore application to a specific revision
   */
  @Post('{revision}/restore')
  async restoreRevision(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Path() revision: number,
    @Body() body: RestoreRevisionBody
  ): Promise<ApplicationRevisionModel> {
    // Check write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationUuid,
      'application:write'
    );

    return await this.revisionService.restoreRevision(
      applicationUuid,
      revision,
      request.user.uuid,
      body.description
    );
  }

  /**
   * Delete a revision (cannot delete published revision)
   */
  @Delete('{revision}')
  async deleteRevision(
    @Request() request: NRequest,
    @Path() applicationUuid: string,
    @Path() revision: number
  ): Promise<void> {
    // Check write permission
    await this.authorizationService.requireAppPermission(
      request.user,
      applicationUuid,
      'application:write'
    );

    await this.revisionService.deleteRevision(
      applicationUuid,
      revision,
      request.user.uuid
    );

    this.setStatus(204);
  }
}

/**
 * Controller for version history of individual entities
 */
@Route('/api/versions')
@Tags('Version History')
@injectable()
export class VersionHistoryController extends Controller {
  constructor(
    private revisionService: RevisionService,
    private authorizationService: AuthorizationService
  ) {
    super();
  }

  /**
   * Get version history for an application
   */
  @Get('applications/{applicationUuid}')
  async getApplicationVersionHistory(
    @Request() request: NRequest,
    @Path() applicationUuid: string
  ): Promise<ApplicationVersionModel[]> {
    const canRead = await this.authorizationService.canAccess(
      request.user,
      applicationUuid,
      'application',
      'application:read',
      applicationUuid
    );

    if (!canRead) {
      this.setStatus(403);
      throw new Error('Access denied: missing read permission');
    }

    return await this.revisionService.getApplicationVersionHistory(applicationUuid);
  }

  /**
   * Get version history for a page
   */
  @Get('pages/{pageUuid}')
  async getPageVersionHistory(
    @Request() request: NRequest,
    @Path() pageUuid: string
  ): Promise<PageVersionModel[]> {
    // TODO: Add proper permission check for page
    return await this.revisionService.getPageVersionHistory(pageUuid);
  }

  /**
   * Get version history for a component
   */
  @Get('components/{componentUuid}')
  async getComponentVersionHistory(
    @Request() request: NRequest,
    @Path() componentUuid: string
  ): Promise<ComponentVersionModel[]> {
    // TODO: Add proper permission check for component
    return await this.revisionService.getComponentVersionHistory(componentUuid);
  }
}
