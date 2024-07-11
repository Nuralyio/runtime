import { IApplicationRepository } from '../interfaces/application.interface';
import { Application } from '../models/application';

export class ApplicationService {
  private ApplicationRepository: IApplicationRepository;

  constructor(productRepository: IApplicationRepository){
    this.ApplicationRepository = productRepository;
  }

  public async create(published:boolean,name: string, uuid: string, user_id:string): Promise<Application> {
    const application: Application = new Application(published,name, uuid, user_id);
    return await this.ApplicationRepository.create(application)
  }

  public async findAll(): Promise<Application[]> {
    return await this.ApplicationRepository.findAll();
  }

  public async findApplicationById(uuid: string): Promise<Application> {
    return await this.ApplicationRepository.findApplicationById(uuid);
  }

  public async update(published:boolean,uuid: string, name: string,user_id:string): Promise<Application> {
    const application: Application = new Application(published,name,uuid,user_id);
    return await this.ApplicationRepository.update(uuid, application);
  }

  public async delete(uuid: string): Promise<Application> {
    return await this.ApplicationRepository.delete(uuid);
  }

}