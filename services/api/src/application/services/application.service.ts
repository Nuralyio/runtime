import { delay, inject, singleton } from 'tsyringe';
import { Application, AppI18nConfig } from '../models/application';
import { ApplicationRepository } from '../repositories/application.repository';
import { ApplicationMemberService } from '../../application-member/services/application-member.service';
import { ResourcePermissionService } from '../../resource-permission/services/resource-permission.service';
import { PageService } from '../../page/services/page.service';
import { RevisionService } from '../../revision/services/revision.service';
import { v4 as uuidv4 } from 'uuid';

@singleton()
export class ApplicationService {
  private applicationRepository: ApplicationRepository;
  private memberService: ApplicationMemberService;
  private resourcePermissionService: ResourcePermissionService;

  constructor(
    applicationRepository: ApplicationRepository,
    memberService: ApplicationMemberService,
    resourcePermissionService: ResourcePermissionService,
    @inject(delay(() => PageService)) private pageService: PageService,
    @inject(delay(() => RevisionService)) private revisionService: RevisionService
  ) {
    this.applicationRepository = applicationRepository;
    this.memberService = memberService;
    this.resourcePermissionService = resourcePermissionService;
  }

  public async create(published: boolean, uuid: string, user_id: string, name?: string): Promise<Application> {
    const application: Application = new Application(published, name ?? this.generateAppName(), uuid, user_id);
    const newApplication = await this.applicationRepository.create(application);

    // Create owner membership for the creator (new system)
    await this.memberService.createOwnerMembership(user_id, newApplication.uuid);

    // Create default page
    this.pageService.create("Page1", "page1", "", newApplication.uuid, user_id, uuidv4(), false, []);
    return newApplication;
  }

  public async findAll(applicationsIds: string[]): Promise<Application[]> {
    return await this.applicationRepository.findAll(applicationsIds);
  }

  public async findApplicationById(uuid: string): Promise<Application> {
    return await this.applicationRepository.findApplicationById(uuid);
  }

  public async findApplicationBySubdomain(subdomain: string): Promise<Application | null> {
    return await this.applicationRepository.findApplicationBySubdomain(subdomain);
  }

  public async update(published?: boolean, uuid?: string, name?: string, user_id?: string, subdomain?: string, requiresAuthOnly?: boolean, i18n?: AppI18nConfig | null, updatedBy?: string): Promise<Application> {
    // Get current application to preserve unchanged fields
    const currentApp = await this.applicationRepository.findApplicationById(uuid!);

    const application: Application = new Application(
      published ?? currentApp.published ?? false,
      name ?? currentApp.name,
      uuid!,
      user_id ?? currentApp.user_id,
      subdomain !== undefined ? (subdomain === '' ? null : subdomain) : currentApp.subdomain,
      requiresAuthOnly ?? currentApp.requiresAuthOnly,
      i18n !== undefined ? i18n : currentApp.i18n
    );
    const updated = await this.applicationRepository.update(uuid!, application);

    // Auto-create application version on update (if updatedBy is provided)
    if (updatedBy) {
      this.autoCreateApplicationVersion(updated, updatedBy);
    }

    return updated;
  }

  /**
   * Auto-create an application version (non-blocking)
   * This tracks the individual application change, NOT a full snapshot
   */
  private autoCreateApplicationVersion(app: Application, userId: string): void {
    this.revisionService.createApplicationVersion(
      app.uuid,
      app.name,
      userId,
      app.subdomain,
      null // defaultPageId - could be added later
    ).catch(err => console.error('Auto-version failed:', err));
  }

  public async delete(uuid: string): Promise<Application> {
    // Delete all pages first
    await this.pageService.deleteApplicationPages(uuid);

    // Delete all resource permissions for this application
    await this.resourcePermissionService.deleteResourcePermissions(uuid, 'application');

    // Delete the application
    return await this.applicationRepository.delete(uuid);
  }

  private generateAppName(): string {
    const adjectives = [
      "fast", "bold", "dynamic", "light", "steady", "silent", "quiet", "fierce", "vibrant", "swift",
      "brave", "graceful", "calm", "intelligent", "sharp", "wild", "mighty", "majestic", "serene", "playful",
      "smooth", "noble", "raging", "powerful", "silent", "sleek", "agile", "radiant", "brilliant", "fiery",
      "strong", "enduring", "fearless", "gritty", "steady", "fearless", "zesty", "unstoppable", "unpredictable"
    ];

    const nouns = [
      "hawk", "phoenix", "tiger", "eagle", "shark", "wolf", "lion", "panther", "jaguar", "falcon",
      "bear", "whale", "octopus", "cheetah", "elephant", "coyote", "buffalo", "raven", "wolf", "leopard",
      "rabbit", "giraffe", "koala", "zebra", "panda", "rhino", "kangaroo", "vulture", "dolphin", "cobra",
      "raccoon", "hippopotamus", "gorilla", "owl", "crocodile", "turtle", "goose", "cobra", "parrot", "seal"
    ];

    const randomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    const adjective = randomElement(adjectives);
    const noun = randomElement(nouns);
    const number = Math.floor(Math.random() * 10000); // More range for uniqueness

    return `${adjective}-${noun}-${number}`;
  }
}