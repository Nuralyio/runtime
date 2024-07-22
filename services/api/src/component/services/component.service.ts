import { injectable } from 'tsyringe';
import { IComponentRepository } from '../interfaces/component.interface';
import { Component } from '../models/component';

@injectable()
export class ComponentService {
  private ComponentRepository: IComponentRepository;

  constructor(commponentRepository: IComponentRepository){
    this.ComponentRepository = commponentRepository;
  }

  public async create(component: object, user_id: string, uuid: string, application_id: string): Promise<Component> {
    const ucomponent: Component = new Component(component,user_id,uuid,application_id);
    return await this.ComponentRepository.create(ucomponent)
  }

  public async findAll(): Promise<Component[]> {
    return await this.ComponentRepository.findAll();
  }

  public async findComponentByApplication(application_id:string): Promise<Component[]> {
    return await this.ComponentRepository.findComponentByApplication(application_id);
  }

  public async update(component: object, user_id: string, uuid: string, application_id: string): Promise<Component> {
    const ucomponent: Component = new Component(component,user_id,uuid,application_id);
    return await this.ComponentRepository.update(uuid,ucomponent);
  }

  public async delete(uuid: string): Promise<Component> {
    return await this.ComponentRepository.delete(uuid);
  }

}