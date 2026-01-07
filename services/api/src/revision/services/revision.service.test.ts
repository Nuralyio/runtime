import 'reflect-metadata';
import { RevisionService } from './revision.service';
import { ApplicationVersionRepository } from '../repositories/application-version.repository';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { ComponentVersionRepository } from '../repositories/component-version.repository';
import { ApplicationRevisionRepository } from '../repositories/application-revision.repository';
import { PublishedVersionRepository } from '../repositories/published-version.repository';
import { ApplicationVersionModel } from '../models/application-version';
import { PageVersionModel } from '../models/page-version';
import { ComponentVersionModel } from '../models/component-version';
import { ApplicationRevisionModel } from '../models/application-revision';
import { PublishedVersionModel } from '../models/published-version';

// Mock repositories
const mockAppVersionRepo = {
  create: jest.fn(),
  findByVersion: jest.fn(),
  findLatestVersion: jest.fn(),
  findAllByApplication: jest.fn(),
};

const mockPageVersionRepo = {
  create: jest.fn(),
  findByVersion: jest.fn(),
  findLatestVersion: jest.fn(),
  findAllByPage: jest.fn(),
  findAllByApplication: jest.fn(),
};

const mockComponentVersionRepo = {
  create: jest.fn(),
  findByVersion: jest.fn(),
  findLatestVersion: jest.fn(),
  findAllByComponent: jest.fn(),
  findAllByApplication: jest.fn(),
};

const mockRevisionRepo = {
  create: jest.fn(),
  findByRevision: jest.fn(),
  findLatestRevision: jest.fn(),
  findAllByApplication: jest.fn(),
  delete: jest.fn(),
};

const mockPublishedVersionRepo = {
  upsert: jest.fn(),
  findByApplication: jest.fn(),
  delete: jest.fn(),
};

const mockApplicationService = {
  findApplicationById: jest.fn(),
  update: jest.fn(),
};

const mockPageService = {
  findPagesByApplicationUUID: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

const mockComponentService = {
  findComponentByApplication: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('RevisionService', () => {
  let revisionService: RevisionService;

  beforeEach(() => {
    jest.clearAllMocks();

    revisionService = new RevisionService(
      mockAppVersionRepo as any,
      mockPageVersionRepo as any,
      mockComponentVersionRepo as any,
      mockRevisionRepo as any,
      mockPublishedVersionRepo as any,
      mockApplicationService as any,
      mockPageService as any,
      mockComponentService as any
    );
  });

  describe('createApplicationVersion', () => {
    it('should create a new application version with incremented version number', async () => {
      const applicationId = 'app-123';
      const name = 'Test App';
      const createdBy = 'user-123';

      mockAppVersionRepo.findLatestVersion.mockResolvedValue(2);
      mockAppVersionRepo.create.mockResolvedValue(
        new ApplicationVersionModel(applicationId, 3, name, createdBy)
      );

      const result = await revisionService.createApplicationVersion(
        applicationId,
        name,
        createdBy
      );

      expect(mockAppVersionRepo.findLatestVersion).toHaveBeenCalledWith(applicationId);
      expect(mockAppVersionRepo.create).toHaveBeenCalled();
      expect(result.version).toBe(3);
    });

    it('should start at version 1 for new applications', async () => {
      const applicationId = 'new-app';
      const name = 'New App';
      const createdBy = 'user-123';

      mockAppVersionRepo.findLatestVersion.mockResolvedValue(0);
      mockAppVersionRepo.create.mockResolvedValue(
        new ApplicationVersionModel(applicationId, 1, name, createdBy)
      );

      const result = await revisionService.createApplicationVersion(
        applicationId,
        name,
        createdBy
      );

      expect(result.version).toBe(1);
    });
  });

  describe('createRevision', () => {
    it('should create a complete revision with all refs', async () => {
      const applicationId = 'app-123';
      const createdBy = 'user-123';

      // Mock application
      mockApplicationService.findApplicationById.mockResolvedValue({
        uuid: applicationId,
        name: 'Test App',
        subdomain: 'test'
      });

      // Mock pages
      mockPageService.findPagesByApplicationUUID.mockResolvedValue([
        { uuid: 'page-1', name: 'Home', url: '/', description: '', style: {}, need_authentification: false, component_ids: ['comp-1'] }
      ]);

      // Mock components
      mockComponentService.findComponentByApplication.mockResolvedValue([
        { uuid: 'comp-1', component: { type: 'button' }, application_id: applicationId }
      ]);

      // Mock version creation
      mockAppVersionRepo.findLatestVersion.mockResolvedValue(0);
      mockAppVersionRepo.create.mockResolvedValue(
        new ApplicationVersionModel(applicationId, 1, 'Test App', createdBy)
      );

      mockPageVersionRepo.findLatestVersion.mockResolvedValue(0);
      mockPageVersionRepo.create.mockResolvedValue(
        new PageVersionModel('page-1', applicationId, 1, 'Home', '/', '', {}, false, ['comp-1'], createdBy)
      );

      mockComponentVersionRepo.findLatestVersion.mockResolvedValue(0);
      mockComponentVersionRepo.create.mockResolvedValue(
        new ComponentVersionModel('comp-1', applicationId, 1, { type: 'button' }, createdBy)
      );

      mockRevisionRepo.findLatestRevision.mockResolvedValue(0);
      mockRevisionRepo.create.mockResolvedValue(
        new ApplicationRevisionModel(
          applicationId, 1, 1,
          [{ pageId: 'page-1', version: 1 }],
          [{ componentId: 'comp-1', version: 1 }],
          createdBy
        )
      );

      const result = await revisionService.createRevision(applicationId, createdBy, {
        description: 'Initial save'
      });

      expect(result.revision).toBe(1);
      expect(result.pageRefs).toHaveLength(1);
      expect(result.componentRefs).toHaveLength(1);
      expect(mockRevisionRepo.create).toHaveBeenCalled();
    });
  });

  describe('getRevisionSnapshot', () => {
    it('should return complete snapshot data for a revision', async () => {
      const applicationId = 'app-123';
      const revision = 1;

      mockRevisionRepo.findByRevision.mockResolvedValue(
        new ApplicationRevisionModel(
          applicationId, revision, 1,
          [{ pageId: 'page-1', version: 1 }],
          [{ componentId: 'comp-1', version: 1 }],
          'user-123'
        )
      );

      mockAppVersionRepo.findByVersion.mockResolvedValue(
        new ApplicationVersionModel(applicationId, 1, 'Test App', 'user-123')
      );

      mockPageVersionRepo.findByVersion.mockResolvedValue(
        new PageVersionModel('page-1', applicationId, 1, 'Home', '/', '', {}, false, ['comp-1'], 'user-123')
      );

      mockComponentVersionRepo.findByVersion.mockResolvedValue(
        new ComponentVersionModel('comp-1', applicationId, 1, { type: 'button' }, 'user-123')
      );

      const snapshot = await revisionService.getRevisionSnapshot(applicationId, revision);

      expect(snapshot.app).toBeDefined();
      expect(snapshot.pages).toHaveLength(1);
      expect(snapshot.components).toHaveLength(1);
    });
  });

  describe('publishRevision', () => {
    it('should publish a revision and update application status', async () => {
      const applicationId = 'app-123';
      const revision = 2;
      const publishedBy = 'user-123';

      mockRevisionRepo.findByRevision.mockResolvedValue(
        new ApplicationRevisionModel(applicationId, revision, 2, [], [], publishedBy)
      );

      mockPublishedVersionRepo.upsert.mockResolvedValue(
        new PublishedVersionModel(applicationId, revision, publishedBy)
      );

      mockApplicationService.update.mockResolvedValue({});

      const result = await revisionService.publishRevision(applicationId, revision, publishedBy);

      expect(result.revision).toBe(revision);
      expect(mockPublishedVersionRepo.upsert).toHaveBeenCalled();
      expect(mockApplicationService.update).toHaveBeenCalledWith(true, applicationId);
    });
  });

  describe('deleteRevision', () => {
    it('should not allow deleting published revision', async () => {
      const applicationId = 'app-123';
      const revision = 2;

      mockPublishedVersionRepo.findByApplication.mockResolvedValue(
        new PublishedVersionModel(applicationId, revision, 'user-123')
      );

      await expect(
        revisionService.deleteRevision(applicationId, revision, 'user-123')
      ).rejects.toThrow('Cannot delete the published revision');
    });

    it('should allow deleting non-published revision', async () => {
      const applicationId = 'app-123';
      const revision = 1;

      mockPublishedVersionRepo.findByApplication.mockResolvedValue(
        new PublishedVersionModel(applicationId, 2, 'user-123') // Different revision is published
      );

      mockRevisionRepo.delete.mockResolvedValue(undefined);

      await revisionService.deleteRevision(applicationId, revision, 'user-123');

      expect(mockRevisionRepo.delete).toHaveBeenCalledWith(applicationId, revision);
    });
  });

  describe('listRevisions', () => {
    it('should return paginated revisions with published flag', async () => {
      const applicationId = 'app-123';

      mockRevisionRepo.findAllByApplication.mockResolvedValue({
        revisions: [
          new ApplicationRevisionModel(applicationId, 2, 2, [], [], 'user-123'),
          new ApplicationRevisionModel(applicationId, 1, 1, [], [], 'user-123'),
        ],
        total: 2
      });

      mockPublishedVersionRepo.findByApplication.mockResolvedValue(
        new PublishedVersionModel(applicationId, 2, 'user-123')
      );

      const result = await revisionService.listRevisions(applicationId, 1, 10);

      expect(result.revisions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasMore).toBe(false);
    });
  });
});
