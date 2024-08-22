import {  singleton } from 'tsyringe';
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

  public async create(published:boolean,name: string, uuid: string, user_id:string): Promise<Application> {
    const application: Application = new Application(published,name, uuid, user_id);
    const newApplication = await this.ApplicationRepository.create(application);
    this.ownershipSercice.create('application', newApplication.uuid, user_id);
    return newApplication;
  }

  public async findAll(applicationsIds : string[]): Promise<Application[]> {
    return await this.ApplicationRepository.findAll(applicationsIds);
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