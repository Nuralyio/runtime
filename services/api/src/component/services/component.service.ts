import { injectable, singleton } from 'tsyringe';
import { IComponentRepository } from '../interfaces/component.interface';
import { Component } from '../models/component';
import { ComponentRepository } from '../repositories/component.repository';

@singleton()
export class ComponentService {
  private componentRepository: ComponentRepository;

  constructor(componentRepository: ComponentRepository) {  
    this.componentRepository = componentRepository;
  }

  public async create(component: Component, user_id: string): Promise<Component> {
    const ucomponent: Component = new Component(component, user_id, component.uuid, component.application_id);
    return await this.componentRepository.create(ucomponent)
  }

  public async findAll(): Promise<Component[]> {
    return await this.componentRepository.findAll();
  }

  public async findComponentByApplication(application_id: string): Promise<Component[]> {
    return await this.componentRepository.findComponentByApplication(application_id);
  }

  public async findComponentsByApplications(application_ids: string[]): Promise<Component[]> {
    if (application_ids.length === 0) {
      return [];
    }
    return await this.componentRepository.findComponentsByApplications(application_ids);
  }

  public async findComponentByUuid(uuid: string): Promise<Component | null> {
    return await this.componentRepository.findComponentByUuid(uuid);
  }

  public async update(component: Component, uuid: string): Promise<Component> {
    return await this.componentRepository.update(uuid, component);
  }

  public async delete(uuids: string[]): Promise<Component[]> {
    return await this.componentRepository.delete(uuids);
  }

}