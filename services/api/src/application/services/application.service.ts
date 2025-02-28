import { singleton } from 'tsyringe';
import { Application } from '../models/application';
import { ApplicationRepository } from '../repositories/application.repository';
import { NUser } from '../../auth/domain/user';
import { OwnershipService } from '../../ownership/services/ownership.service';
@singleton()
export class ApplicationService {
  private ApplicationRepository: ApplicationRepository;
  private ownershipSercice: OwnershipService;

  constructor(productRepository: ApplicationRepository, ownershipService: OwnershipService) {
    this.ApplicationRepository = productRepository;
    this.ownershipSercice = ownershipService
    //this.ownershipSercice = new OwernshipService
  }

  public async create(published: boolean, uuid: string, user_id: string, name?: string): Promise<Application> {
    const application: Application = new Application(published, name ?? this.generateAppName(), uuid, user_id);
    const newApplication = await this.ApplicationRepository.create(application);
    this.ownershipSercice.create('application', newApplication.uuid, user_id);
    return newApplication;
  }

  public async findAll(applicationsIds: string[]): Promise<Application[]> {
    return await this.ApplicationRepository.findAll(applicationsIds);
  }

  public async findApplicationById(uuid: string): Promise<Application> {
    return await this.ApplicationRepository.findApplicationById(uuid);
  }

  public async update(published: boolean, uuid: string, name: string, user_id: string): Promise<Application> {
    const application: Application = new Application(published, name, uuid, user_id);
    return await this.ApplicationRepository.update(uuid, application);
  }

  public async delete(uuid: string): Promise<Application> {
    return await this.ApplicationRepository.delete(uuid);
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