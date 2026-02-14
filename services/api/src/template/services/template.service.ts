import { singleton, inject, delay } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';
import { TemplateRepository } from '../repositories/template.repository';
import { AppTemplate, TemplateSnapshot, TemplatePageSnapshot, TemplateComponentSnapshot } from '../models/template';
import { PageService } from '../../page/services/page.service';
import { ComponentService } from '../../component/services/component.service';
import { ApplicationService } from '../../application/services/application.service';
import { ApplicationMemberService } from '../../application-member/services/application-member.service';

@singleton()
export class TemplateService {

  constructor(
    private readonly templateRepository: TemplateRepository,
    @inject(delay(() => PageService)) private readonly pageService: PageService,
    @inject(delay(() => ComponentService)) private readonly componentService: ComponentService,
    @inject(delay(() => ApplicationService)) private readonly applicationService: ApplicationService,
    @inject(delay(() => ApplicationMemberService)) private readonly memberService: ApplicationMemberService
  ) {}

  /**
   * Create a template by snapshotting an existing app's pages, components, workflows, and functions.
   */
  public async createTemplate(
    appId: string,
    name: string,
    description: string,
    category: string,
    userId: string,
    thumbnail?: string | null
  ): Promise<AppTemplate> {
    // Verify app exists
    await this.applicationService.findApplicationById(appId);

    // Snapshot pages
    const pages = await this.pageService.findPagesByApplicationUUID(appId);
    const pageSnapshots: TemplatePageSnapshot[] = pages.map(page => ({
      originalUuid: page.uuid,
      name: page.name,
      url: page.url,
      description: page.description,
      style: page.style || {},
      event: page.event || {},
      need_authentication: page.need_authentification,
      component_ids: page.component_ids,
    }));

    // Snapshot components
    const components = await this.componentService.findComponentByApplication(appId);
    const componentSnapshots: TemplateComponentSnapshot[] = components.map(comp => ({
      originalUuid: comp.uuid,
      component: comp.component,
    }));

    // Snapshot workflows via HTTP call to workflows service
    const workflows = await this.fetchWorkflows(appId);

    // Snapshot functions via HTTP call to functions service
    const functions = await this.fetchFunctions(appId);

    const snapshot: TemplateSnapshot = {
      pages: pageSnapshots,
      components: componentSnapshots,
      workflows,
      functions,
    };

    const template = new AppTemplate(name, description, category, appId, userId, snapshot, false, false, false, thumbnail);
    return await this.templateRepository.create(template);
  }

  /**
   * Instantiate a new app from a template, creating fresh UUIDs for all entities.
   */
  public async instantiate(
    templateId: string,
    appName: string,
    userId: string
  ): Promise<{ uuid: string; name: string }> {
    const template = await this.templateRepository.findById(templateId);
    const snapshot = template.snapshot;

    // Create the new application
    const newAppUuid = uuidv4();
    const newApp = await this.applicationService.create(false, newAppUuid, userId, appName);

    // Delete the default page created by applicationService.create
    try {
      const defaultPages = await this.pageService.findPagesByApplicationUUID(newAppUuid);
      if (defaultPages.length > 0) {
        await this.pageService.delete(defaultPages.map(p => p.uuid));
      }
    } catch (e) {
      // Ignore if no pages to delete
    }

    // Build UUID remap: old -> new
    const uuidMap = new Map<string, string>();

    // Generate new UUIDs for pages
    for (const pageSnap of snapshot.pages) {
      uuidMap.set(pageSnap.originalUuid, uuidv4());
    }

    // Generate new UUIDs for components
    for (const compSnap of snapshot.components) {
      uuidMap.set(compSnap.originalUuid, uuidv4());
    }

    // Create components with remapped UUIDs
    for (const compSnap of snapshot.components) {
      const newUuid = uuidMap.get(compSnap.originalUuid)!;
      const remappedComponent = this.remapComponentJson(compSnap.component, uuidMap, newAppUuid);
      await this.componentService.create(
        { component: remappedComponent, user_id: userId, uuid: newUuid, application_id: newAppUuid } as any,
        userId
      );
    }

    // Create pages with remapped UUIDs and component_ids
    for (const pageSnap of snapshot.pages) {
      const newPageUuid = uuidMap.get(pageSnap.originalUuid)!;
      const newComponentIds = pageSnap.component_ids.map(id => uuidMap.get(id) || id);

      await this.pageService.create(
        pageSnap.name,
        pageSnap.url,
        pageSnap.description,
        newAppUuid,
        userId,
        newPageUuid,
        pageSnap.need_authentication,
        newComponentIds
      );
    }

    // Clone workflows via HTTP call to workflows service
    await this.cloneWorkflows(snapshot.workflows, newAppUuid);

    // Clone functions via HTTP call to functions service
    await this.cloneFunctions(snapshot.functions, newAppUuid);

    return { uuid: newApp.uuid, name: newApp.name };
  }

  public async findAll(userId: string): Promise<AppTemplate[]> {
    return await this.templateRepository.findAll(userId);
  }

  public async findById(id: string): Promise<AppTemplate> {
    return await this.templateRepository.findById(id);
  }

  public async update(
    id: string,
    data: Partial<Pick<AppTemplate, 'name' | 'description' | 'category' | 'thumbnail' | 'public' | 'verified' | 'editorChoice'>>
  ): Promise<AppTemplate> {
    return await this.templateRepository.update(id, data);
  }

  public async delete(id: string): Promise<AppTemplate> {
    return await this.templateRepository.delete(id);
  }

  /**
   * Deep-walk a component JSON tree and remap uuid, children_ids, and application_id.
   */
  private remapComponentJson(component: any, uuidMap: Map<string, string>, newAppId: string): any {
    if (!component || typeof component !== 'object') return component;

    const remapped = Array.isArray(component) ? [...component] : { ...component };

    if (remapped.uuid && uuidMap.has(remapped.uuid)) {
      remapped.uuid = uuidMap.get(remapped.uuid);
    }

    if (remapped.application_id) {
      remapped.application_id = newAppId;
    }

    if (Array.isArray(remapped.children_ids)) {
      remapped.children_ids = remapped.children_ids.map((id: string) => uuidMap.get(id) || id);
    }

    // Recursively remap nested objects
    for (const key of Object.keys(remapped)) {
      if (key === 'uuid' || key === 'application_id' || key === 'children_ids') continue;
      if (typeof remapped[key] === 'object' && remapped[key] !== null) {
        remapped[key] = this.remapComponentJson(remapped[key], uuidMap, newAppId);
      }
    }

    return remapped;
  }

  /**
   * Fetch workflows for an app from the workflows service.
   */
  private async fetchWorkflows(appId: string): Promise<any[]> {
    const workflowsUrl = process.env.WORKFLOWS_URL;
    if (!workflowsUrl) return [];

    try {
      const response = await fetch(`${workflowsUrl}/api/v1/workflows?applicationId=${appId}`);
      if (!response.ok) return [];
      const workflows = await response.json();
      return Array.isArray(workflows) ? workflows.map((w: any) => ({
        id: w.id,
        name: w.name || '',
        description: w.description || '',
        variables: w.variables || '',
        nodes: w.nodes || [],
        edges: w.edges || [],
      })) : [];
    } catch (e) {
      console.error('Failed to fetch workflows for template:', e);
      return [];
    }
  }

  /**
   * Fetch functions for an app from the functions service.
   */
  private async fetchFunctions(appId: string): Promise<any[]> {
    const functionsUrl = process.env.FUNCTIONS_URL;
    if (!functionsUrl) return [];

    try {
      const response = await fetch(`${functionsUrl}/api/v1/functions?applicationId=${appId}`);
      if (!response.ok) return [];
      const functions = await response.json();
      return Array.isArray(functions) ? functions.map((f: any) => ({
        id: f.id,
        label: f.label || '',
        description: f.description || '',
        template: f.template || '',
        runtime: f.runtime || '',
        handler: f.handler || '',
      })) : [];
    } catch (e) {
      console.error('Failed to fetch functions for template:', e);
      return [];
    }
  }

  /**
   * Clone workflows into a new app via the workflows service.
   */
  private async cloneWorkflows(workflows: any[], newAppId: string): Promise<void> {
    const workflowsUrl = process.env.WORKFLOWS_URL;
    if (!workflowsUrl || workflows.length === 0) return;

    for (const workflow of workflows) {
      try {
        const response = await fetch(`${workflowsUrl}/api/v1/workflows/${workflow.id}/clone`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: newAppId }),
        });
        if (!response.ok) {
          console.error(`Failed to clone workflow ${workflow.id}: ${response.statusText}`);
        }
      } catch (e) {
        console.error(`Failed to clone workflow ${workflow.id}:`, e);
      }
    }
  }

  /**
   * Clone functions into a new app via the functions service.
   */
  private async cloneFunctions(functions: any[], newAppId: string): Promise<void> {
    const functionsUrl = process.env.FUNCTIONS_URL;
    if (!functionsUrl || functions.length === 0) return;

    for (const func of functions) {
      try {
        const response = await fetch(`${functionsUrl}/api/v1/functions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: newAppId,
            label: func.label,
            description: func.description,
            template: func.template,
            runtime: func.runtime,
            handler: func.handler,
          }),
        });
        if (!response.ok) {
          console.error(`Failed to clone function ${func.id}: ${response.statusText}`);
        }
      } catch (e) {
        console.error(`Failed to clone function ${func.id}:`, e);
      }
    }
  }
}
