import { injectable } from 'tsyringe';
import { IComponentRepository } from '../interfaces/component.interface';
import { Component } from '../models/component';

@injectable()
export class ComponentService {
  private ComponentRepository: IComponentRepository;

  constructor(commponentRepository: IComponentRepository) {
    this.ComponentRepository = commponentRepository;
  }

  public async create(component: Component, user_id: string): Promise<Component> {
    const ucomponent: Component = new Component(component, user_id, component.uuid, component.application_id);
    return await this.ComponentRepository.create(ucomponent)
  }

  public async findAll(): Promise<Component[]> {
    return await this.ComponentRepository.findAll();
  }

  public async findComponentByApplication(application_id: string): Promise<Component[]> {
    return await this.ComponentRepository.findComponentByApplication(application_id);
  }

  public async findComponentByUuid(uuid: string): Promise<Component | null> {
    return await this.ComponentRepository.findComponentByUuid(uuid);
  }

  public async update(component: Component, uuid: string): Promise<Component> {
    return await this.ComponentRepository.update(uuid, component);
  }

  public async delete(uuid: string): Promise<Component> {
    return await this.ComponentRepository.delete(uuid);
  }

}