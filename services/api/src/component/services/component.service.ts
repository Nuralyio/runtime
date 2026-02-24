import { singleton, inject, delay } from 'tsyringe';
import { IComponentRepository } from '../interfaces/component.interface';
import { Component } from '../models/component';
import { ComponentRepository } from '../repositories/component.repository';
import { RevisionService } from '../../revision/services/revision.service';

@singleton()
export class ComponentService {
  constructor(
    private componentRepository: ComponentRepository,
    @inject(delay(() => RevisionService)) private revisionService: RevisionService
  ) {}

  public async create(component: Component, user_id: string): Promise<Component> {
    const ucomponent: Component = new Component(component, user_id, component.uuid, component.application_id);
    const created = await this.componentRepository.create(ucomponent);

    // Auto-create component version on create
    if (created.application_id) {
      this.autoCreateComponentVersion(created, user_id);
    }

    return created;
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

  public async update(component: Component, uuid: string, userId?: string): Promise<Component> {
    const updated = await this.componentRepository.update(uuid, component);

    // Auto-create component version on update
    if (userId && updated.application_id) {
      this.autoCreateComponentVersion(updated, userId);
    }

    return updated;
  }

  public async delete(uuids: string[]): Promise<Component[]> {
    return await this.componentRepository.delete(uuids);
  }

  /**
   * Auto-create a component version (non-blocking)
   * This tracks the individual component change, NOT a full application snapshot
   */
  private autoCreateComponentVersion(component: Component, userId: string): void {
    // Run async without blocking the main operation
    this.revisionService.createComponentVersion(
      component.uuid,
      component.application_id,
      component.component,
      userId
    ).catch(err => console.error('Auto-version failed:', err));
  }
}
