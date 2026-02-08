/**
 * Workflows List Component
 * Displays a file-explorer style view of workflows organized into folders (categories)
 * Supports navigating into folders, breadcrumb navigation, drag-and-drop, and folder CRUD
 * Uses KV storage for user preferences via nanostores
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './WorkflowsList.style';
import { formatDate, type WorkflowWithAppName, type ApplicationWithStatus } from '../../services/dashboard.service';
import {
  $pinnedWorkflows,
  $workflowsViewMode,
  $preferencesLoading,
  initUserPreferences,
  togglePinnedWorkflow,
  setWorkflowsViewMode,
  cleanupPinnedWorkflows,
  $folderSectionVisible,
  toggleFolderSectionVisible,
} from '../../stores/user-preferences.store';
import { getWorkflowService, getCategoryService } from '../../../../services/lazy-loader';
import type { WorkflowDTO } from '../../../../services/workflow.service';
import type { IHeader } from '../../../runtime/components/ui/nuraly-ui/src/components/table/table.types';
import type { Category } from '../../../../services/category.service';
import { WORKFLOW_TEMPLATES, type WorkflowTemplateDefinition } from '../../../../services/workflow-templates';

// Import NuralyUI components
import '../../../runtime/components/ui/nuraly-ui/src/components/button';
import '../../../runtime/components/ui/nuraly-ui/src/components/badge';
import '../../../runtime/components/ui/nuraly-ui/src/components/table';
import '../../../runtime/components/ui/nuraly-ui/src/components/dropdown';
import '../../../runtime/components/ui/nuraly-ui/src/components/input';
import '../../../runtime/components/ui/nuraly-ui/src/components/select';
import '../../../runtime/components/ui/nuraly-ui/src/components/tag';
import '../../../runtime/components/ui/nuraly-ui/src/components/card';
import '../../../runtime/components/ui/nuraly-ui/src/components/icon';
import '../../../runtime/components/ui/nuraly-ui/src/components/radio-group';

type ViewMode = 'cards' | 'table';

@customElement('workflows-list')
export class WorkflowsList extends LitElement {
  static styles = styles;

  @property({ type: Array }) workflows: WorkflowWithAppName[] = [];
  @property({ type: Array }) applications: ApplicationWithStatus[] = [];

  @state() private showCreateDropdown = false;
  @state() private showBlankForm = false;
  @state() private showTemplateModal = false;
  @state() private selectedTemplate: WorkflowTemplateDefinition | null = null;
  @state() private selectedUserTemplate: WorkflowWithAppName | null = null;
  @state() private userTemplates: WorkflowWithAppName[] = [];
  @state() private isCreating = false;
  @state() private workflowName = '';
  @state() private viewMode: ViewMode = 'table';
  @state() private pinnedIds: Set<string> = new Set();
  @state() private preferencesLoading = true;
  @state() private folderSectionVisible = true;

  // Category/folder state
  @state() private categories: Category[] = [];
  @state() private categoryResourceMap: Map<string, string> = new Map(); // workflowUuid → categoryUuid

  // File-explorer navigation state
  @state() private currentFolderUuid: string | null = null; // null = root level
  @state() private currentPath: Category[] = []; // breadcrumb stack
  @state() private currentFolderChildren: Category[] = [];
  @state() private currentFolderWorkflows: WorkflowWithAppName[] = [];
  @state() private loadingFolder = false;

  // Folder create/rename
  @state() private showNewFolderInput = false;
  @state() private newFolderName = '';
  @state() private isCreatingFolder = false;
  @state() private renamingFolderUuid: string | null = null;
  @state() private renameFolderName = '';

  // Context menu
  @state() private contextMenuTarget: { type: 'folder'; uuid: string } | null = null;
  @state() private contextMenuPos = { x: 0, y: 0 };
  @state() private isDeletingFolder = false;

  // Drag-and-drop
  @state() private dragOverFolderUuid: string | null = null;

  private unsubscribes: (() => void)[] = [];
  private boundCloseContextMenu = this.closeContextMenu.bind(this);

  override connectedCallback() {
    super.connectedCallback();

    initUserPreferences();

    this.unsubscribes.push(
      $pinnedWorkflows.subscribe(pinned => {
        this.pinnedIds = pinned;
        this.requestUpdate();
      })
    );

    this.unsubscribes.push(
      $workflowsViewMode.subscribe(mode => {
        this.viewMode = mode;
      })
    );

    this.unsubscribes.push(
      $preferencesLoading.subscribe(loading => {
        this.preferencesLoading = loading;
      })
    );

    this.unsubscribes.push(
      $folderSectionVisible.subscribe(visible => {
        this.folderSectionVisible = visible;
      })
    );

    document.addEventListener('click', this.boundCloseContextMenu);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribes.forEach(unsub => unsub());
    this.unsubscribes = [];
    document.removeEventListener('click', this.boundCloseContextMenu);
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('workflows') && this.workflows.length > 0) {
      const validWorkflowIds = new Set(this.workflows.map(w => w.uuid));
      cleanupPinnedWorkflows(validWorkflowIds);
    }

    if (changedProperties.has('applications') && this.applications.length > 0) {
      this.loadCategories();
    }
  }

  // ─── Category data loading ───────────────────────────────────

  private async loadCategories() {
    try {
      const catService = await getCategoryService();
      const allCategories: Category[] = [];
      const resourceMap = new Map<string, string>();

      const appIds = [...new Set(this.applications.map(a => a.uuid))];
      const results = await Promise.all(
        appIds.map(appId => catService.getCategories(appId, 'workflow').catch(() => [] as Category[]))
      );
      for (const cats of results) {
        allCategories.push(...cats);
      }

      // Build resource map: for each category, fetch its resources
      await Promise.all(
        allCategories.map(async (cat) => {
          try {
            const resources = await catService.getCategoryResources(cat.uuid);
            for (const res of resources) {
              resourceMap.set(res.resourceId, cat.uuid);
            }
          } catch {
            // ignore per-category errors
          }
        })
      );

      this.categories = allCategories;
      this.categoryResourceMap = resourceMap;
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }

  // ─── File-explorer navigation ────────────────────────────────

  private async navigateToFolder(uuid: string) {
    this.loadingFolder = true;
    try {
      const catService = await getCategoryService();
      const category = await catService.getCategory(uuid);

      // Update path
      const existingIndex = this.currentPath.findIndex(c => c.uuid === uuid);
      if (existingIndex >= 0) {
        // Navigating to an ancestor already in path
        this.currentPath = this.currentPath.slice(0, existingIndex + 1);
      } else {
        this.currentPath = [...this.currentPath, category];
      }

      this.currentFolderUuid = uuid;
      this.currentFolderChildren = category.children || [];

      // Fetch resources in this folder
      const resources = await catService.getCategoryResources(uuid);
      const resourceIds = new Set(resources.map(r => r.resourceId));
      this.currentFolderWorkflows = this.workflows.filter(w => resourceIds.has(w.uuid));
    } catch (error) {
      console.error('Failed to navigate to folder:', error);
    } finally {
      this.loadingFolder = false;
    }
  }

  private navigateToRoot() {
    this.currentFolderUuid = null;
    this.currentPath = [];
    this.currentFolderChildren = [];
    this.currentFolderWorkflows = [];
  }

  private navigateToBreadcrumb(index: number) {
    if (index < 0) {
      this.navigateToRoot();
    } else {
      const target = this.currentPath[index];
      this.navigateToFolder(target.uuid);
    }
  }

  // ─── Computed properties ─────────────────────────────────────

  private get displayFolders(): Category[] {
    if (this.currentFolderUuid === null) {
      return this.categories;
    }
    return this.currentFolderChildren;
  }

  private get workflowsWithPinnedStatus(): WorkflowWithAppName[] {
    return this.workflows.map(w => ({
      ...w,
      isPinned: this.pinnedIds.has(w.uuid)
    }));
  }

  private get allPinnedWorkflows(): WorkflowWithAppName[] {
    return this.workflows
      .filter(w => this.pinnedIds.has(w.uuid))
      .map(w => ({ ...w, isPinned: true }));
  }

  private get unpinnedDisplayWorkflows(): WorkflowWithAppName[] {
    return this.workflowsWithPinnedStatus.filter(w => !w.isPinned);
  }

  private get viewModeOptions() {
    return [
      { value: 'cards', label: '', icon: 'grid' },
      { value: 'table', label: '', icon: 'list' }
    ];
  }

  private async handleViewModeChange(e: CustomEvent) {
    const value = e.detail?.value;
    if (value === 'cards' || value === 'table') {
      await setWorkflowsViewMode(value);
    }
  }

  // ─── Table headers ───────────────────────────────────────────

  private getTableHeaders(): IHeader[] {
    return [
      {
        name: '',
        key: 'isPinned',
        width: 40,
        render: (_value: boolean, row: WorkflowWithAppName) => html`
          <nr-icon
            name="star"
            class="pin-icon ${row.isPinned ? 'pinned' : ''}"
            title=${row.isPinned ? 'Unpin workflow' : 'Pin workflow'}
            @click=${(e: Event) => this.handlePin(e, row)}
          ></nr-icon>
        `,
      },
      {
        name: 'Name',
        key: 'name',
        render: (value: string, row: WorkflowWithAppName) => html`
          <span class="workflow-name-cell">
            <span
              class="workflow-name"
              draggable="true"
              @dragstart=${(e: DragEvent) => this.handleWorkflowDragStart(e, row)}
            >${value}</span>
            ${row.isTemplate ? html`<nr-tag size="small" status="info">Template</nr-tag>` : nothing}
          </span>
        `,
      },
      {
        name: 'Application',
        key: 'applicationName',
        render: (value: string) => html`<span class="workflow-app">${value || 'Unknown'}</span>`,
      },
      {
        name: 'Status',
        key: 'status',
        render: (value: string) => html`
          <span class="status-badge ${value === 'active' ? 'active' : 'inactive'}">
            <span class="status-dot"></span>
            ${value === 'active' ? 'Active' : 'Inactive'}
          </span>
        `,
      },
      {
        name: 'Last Updated',
        key: 'updatedAt',
        render: (value: string) => html`<span class="date-text">${formatDate(value)}</span>`,
      },
      {
        name: 'Actions',
        key: 'actions',
        width: 150,
        render: (_value: any, row: WorkflowWithAppName) => html`
          <div class="actions-cell">
            <nr-button
              type="default"
              size="small"
              iconLeft="Play"
              title="Run workflow"
              @click=${(e: Event) => this.handleRun(e, row)}
            >Run</nr-button>
            <nr-button
              type="default"
              size="small"
              iconLeft="Pencil"
              title="Edit workflow"
              @click=${(e: Event) => this.handleEdit(e, row)}
            >Edit</nr-button>
          </div>
        `,
      },
    ];
  }

  // ─── Workflow action handlers ────────────────────────────────

  private handleRowClick(workflow: WorkflowWithAppName) {
    window.location.href = `/dashboard/workflow/${workflow.uuid}`;
  }

  private handleEdit(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    if (workflow.applicationId) {
      window.location.href = `/app/studio/${workflow.applicationId}/workflows?workflow=${workflow.uuid}`;
    } else {
      window.location.href = `/dashboard/workflow/${workflow.uuid}`;
    }
  }

  private handleRun(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('run-workflow', {
      detail: { workflowId: workflow.uuid },
      bubbles: true,
      composed: true
    }));
  }

  private async handlePin(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    await togglePinnedWorkflow(workflow.uuid);
  }

  private async handleToggleTemplate(e: Event, workflow: WorkflowWithAppName) {
    e.stopPropagation();
    try {
      const workflowService = await getWorkflowService();
      const newIsTemplate = !workflow.isTemplate;
      await workflowService.setTemplate(workflow.uuid, newIsTemplate);
      // Update the local workflows array
      const idx = this.workflows.findIndex(w => w.uuid === workflow.uuid);
      if (idx >= 0) {
        this.workflows = this.workflows.map(w =>
          w.uuid === workflow.uuid ? { ...w, isTemplate: newIsTemplate } : w
        );
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error);
    }
  }

  // ─── Create workflow handlers ────────────────────────────────

  private closeCreateDropdown() {
    this.showCreateDropdown = false;
    this.showBlankForm = false;
    this.workflowName = '';
  }

  private handleSelectBlankWorkflow() {
    this.showBlankForm = true;
  }

  private async handleSelectFromTemplate() {
    this.showCreateDropdown = false;
    this.showTemplateModal = true;
    this.selectedTemplate = null;
    this.selectedUserTemplate = null;
    await this.loadUserTemplates();
  }

  private async loadUserTemplates() {
    try {
      const workflowService = await getWorkflowService();
      const templates = await workflowService.getTemplates();
      // Build app name map
      const appNameMap = new Map<string, string>();
      for (const app of this.applications) {
        appNameMap.set(app.uuid, app.name);
      }
      this.userTemplates = templates.map(t => ({
        ...t,
        uuid: t.id,
        status: 'active',
        nodes: t.nodes || [],
        edges: t.edges || [],
        applicationName: appNameMap.get(t.applicationId) || 'Unknown',
      }));
    } catch (error) {
      console.error('Failed to load user templates:', error);
      this.userTemplates = [];
    }
  }

  private handleBackToOptions() {
    this.showBlankForm = false;
  }

  private closeTemplateModal() {
    this.showTemplateModal = false;
    this.selectedTemplate = null;
  }

  private handleTemplateSelect(template: WorkflowTemplateDefinition) {
    this.selectedTemplate = template;
    this.selectedUserTemplate = null;
  }

  private handleUserTemplateSelect(template: WorkflowWithAppName) {
    this.selectedUserTemplate = template;
    this.selectedTemplate = null;
  }

  private handleNameInput(e: CustomEvent) {
    this.workflowName = e.detail?.value || (e.target as HTMLInputElement)?.value || '';
  }

  private async handleCreateWorkflow() {
    const name = this.workflowName.trim();
    if (!name) return;

    const select = this.shadowRoot?.querySelector('.blank-form-container nr-select') as any;
    const applicationId = select?.value || '';

    await this.createWorkflow(name, applicationId);
  }

  private async handleCreateFromTemplate() {
    const select = this.shadowRoot?.querySelector('.template-modal-body nr-select') as any;
    const applicationId = select?.value || '';

    if (!applicationId) return;

    this.isCreating = true;
    try {
      const workflowService = await getWorkflowService();
      let workflowUuid: string;

      if (this.selectedUserTemplate) {
        // Create from user template via backend clone
        const workflow = await workflowService.createFromTemplate(
          this.selectedUserTemplate.uuid,
          this.selectedUserTemplate.name,
          applicationId
        );
        workflowUuid = (workflow as any).uuid || workflow.id;
      } else if (this.selectedTemplate) {
        // Create from built-in template
        const workflow = await workflowService.createWorkflowFromTemplate(
          applicationId,
          this.selectedTemplate
        );
        workflowUuid = (workflow as any).uuid || workflow.id;
      } else {
        return;
      }

      this.closeTemplateModal();

      this.dispatchEvent(new CustomEvent('refresh', {
        bubbles: true,
        composed: true
      }));

      window.location.href = `/app/studio/${applicationId}/workflows?workflow=${workflowUuid}`;
    } catch (error) {
      console.error('Failed to create workflow from template:', error);
    } finally {
      this.isCreating = false;
    }
  }

  private async createWorkflow(name: string, applicationId: string) {
    this.isCreating = true;
    try {
      const workflowService = await getWorkflowService();

      const workflow = await workflowService.createWorkflow(
        applicationId,
        name
      );

      this.closeCreateDropdown();

      this.dispatchEvent(new CustomEvent('refresh', {
        bubbles: true,
        composed: true
      }));

      const appId = applicationId || workflow.applicationId;
      const workflowUuid = workflow.uuid || workflow.id;
      if (appId) {
        window.location.href = `/app/studio/${appId}/workflows?workflow=${workflowUuid}`;
      } else {
        window.location.href = `/dashboard/workflow/${workflowUuid}`;
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      this.isCreating = false;
    }
  }

  private getAppOptions() {
    return this.applications.map(app => ({
      value: app.uuid,
      label: app.name
    }));
  }

  // ─── Folder CRUD handlers ──────────────────────────────────

  private handleShowNewFolderInput() {
    this.showNewFolderInput = true;
    this.newFolderName = '';
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.new-folder-input') as HTMLInputElement;
      input?.focus();
    });
  }

  private handleNewFolderNameInput(e: Event) {
    this.newFolderName = (e.target as HTMLInputElement).value;
  }

  private async handleCreateFolderKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      await this.submitCreateFolder();
    } else if (e.key === 'Escape') {
      this.showNewFolderInput = false;
      this.newFolderName = '';
    }
  }

  private async handleNewFolderBlur() {
    if (this.newFolderName.trim()) {
      await this.submitCreateFolder();
    } else {
      this.showNewFolderInput = false;
    }
  }

  private async submitCreateFolder() {
    const name = this.newFolderName.trim();
    if (!name || this.isCreatingFolder) return;

    const applicationId = this.applications[0]?.uuid;
    if (!applicationId) return;

    this.isCreatingFolder = true;
    try {
      const catService = await getCategoryService();
      const created = await catService.createCategory({
        name,
        applicationId,
        resourceType: 'workflow',
        parentUuid: this.currentFolderUuid ?? undefined,
      });

      if (this.currentFolderUuid === null) {
        // At root: add to root categories
        this.categories = [...this.categories, created];
      } else {
        // Inside a folder: add to current folder children
        this.currentFolderChildren = [...this.currentFolderChildren, created];
      }

      this.showNewFolderInput = false;
      this.newFolderName = '';
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      this.isCreatingFolder = false;
    }
  }

  // ─── Folder context menu ───────────────────────────────────

  private handleFolderContextMenu(e: MouseEvent, uuid: string) {
    e.preventDefault();
    e.stopPropagation();
    this.contextMenuTarget = { type: 'folder', uuid };
    this.contextMenuPos = { x: e.clientX, y: e.clientY };
  }

  private closeContextMenu() {
    this.contextMenuTarget = null;
  }

  private handleStartRenameFolder(uuid: string) {
    const allFolders = [...this.categories, ...this.currentFolderChildren];
    const folder = allFolders.find(c => c.uuid === uuid);
    if (!folder) return;
    this.renamingFolderUuid = uuid;
    this.renameFolderName = folder.name;
    this.closeContextMenu();
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.rename-folder-input') as HTMLInputElement;
      input?.focus();
      input?.select();
    });
  }

  private handleRenameFolderInput(e: Event) {
    this.renameFolderName = (e.target as HTMLInputElement).value;
  }

  private async handleRenameFolderKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      await this.submitRenameFolder();
    } else if (e.key === 'Escape') {
      this.renamingFolderUuid = null;
      this.renameFolderName = '';
    }
  }

  private async handleRenameFolderBlur() {
    if (this.renameFolderName.trim()) {
      await this.submitRenameFolder();
    } else {
      this.renamingFolderUuid = null;
    }
  }

  private async submitRenameFolder() {
    const name = this.renameFolderName.trim();
    const uuid = this.renamingFolderUuid;
    if (!name || !uuid) return;

    try {
      const catService = await getCategoryService();
      const updated = await catService.updateCategory(uuid, { name });
      this.categories = this.categories.map(c => c.uuid === uuid ? { ...c, name: updated.name } : c);
      this.currentFolderChildren = this.currentFolderChildren.map(c => c.uuid === uuid ? { ...c, name: updated.name } : c);
      this.currentPath = this.currentPath.map(c => c.uuid === uuid ? { ...c, name: updated.name } : c);
    } catch (error) {
      console.error('Failed to rename folder:', error);
    } finally {
      this.renamingFolderUuid = null;
      this.renameFolderName = '';
    }
  }

  private async handleDeleteFolder(uuid: string) {
    this.closeContextMenu();
    this.isDeletingFolder = true;
    try {
      const catService = await getCategoryService();
      await catService.deleteCategory(uuid);
      this.categories = this.categories.filter(c => c.uuid !== uuid);
      this.currentFolderChildren = this.currentFolderChildren.filter(c => c.uuid !== uuid);

      // Remove resources from map that belonged to this category
      const newMap = new Map(this.categoryResourceMap);
      for (const [resId, catUuid] of newMap) {
        if (catUuid === uuid) newMap.delete(resId);
      }
      this.categoryResourceMap = newMap;
    } catch (error) {
      console.error('Failed to delete folder:', error);
    } finally {
      this.isDeletingFolder = false;
    }
  }

  // ─── Drag and drop ───────────────────────────────────────────

  private handleWorkflowDragStart(e: DragEvent, workflow: WorkflowWithAppName) {
    e.dataTransfer?.setData('text/plain', JSON.stringify({
      workflowUuid: workflow.uuid,
      applicationId: workflow.applicationId,
    }));
    e.dataTransfer!.effectAllowed = 'move';
  }

  private handleFolderDragOver(e: DragEvent, uuid: string) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    this.dragOverFolderUuid = uuid;
  }

  private handleFolderDragLeave() {
    this.dragOverFolderUuid = null;
  }

  private async handleFolderDrop(e: DragEvent, targetFolderUuid: string) {
    e.preventDefault();
    this.dragOverFolderUuid = null;

    const raw = e.dataTransfer?.getData('text/plain');
    if (!raw) return;

    try {
      const { workflowUuid } = JSON.parse(raw);
      if (!workflowUuid) return;

      const catService = await getCategoryService();

      // Remove from old category first if needed
      const currentCatUuid = this.categoryResourceMap.get(workflowUuid);
      if (currentCatUuid) {
        await catService.removeResource(currentCatUuid, workflowUuid, 'workflow');
      }

      // Assign to the target folder
      await catService.assignResource(targetFolderUuid, workflowUuid, 'workflow');
      const newMap = new Map(this.categoryResourceMap);
      newMap.set(workflowUuid, targetFolderUuid);
      this.categoryResourceMap = newMap;

      // If inside a folder, refresh its workflows
      if (this.currentFolderUuid !== null) {
        await this.navigateToFolder(this.currentFolderUuid);
      }
    } catch (error) {
      console.error('Failed to move workflow to folder:', error);
    }
  }

  private handleBreadcrumbRootDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'move';
    this.dragOverFolderUuid = '__root__';
  }

  private handleBreadcrumbRootDragLeave() {
    this.dragOverFolderUuid = null;
  }

  private async handleBreadcrumbRootDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOverFolderUuid = null;

    const raw = e.dataTransfer?.getData('text/plain');
    if (!raw) return;

    try {
      const { workflowUuid } = JSON.parse(raw);
      if (!workflowUuid) return;

      const currentCatUuid = this.categoryResourceMap.get(workflowUuid);
      if (currentCatUuid) {
        const catService = await getCategoryService();
        await catService.removeResource(currentCatUuid, workflowUuid, 'workflow');
        const newMap = new Map(this.categoryResourceMap);
        newMap.delete(workflowUuid);
        this.categoryResourceMap = newMap;

        // Refresh if inside a folder
        if (this.currentFolderUuid !== null) {
          await this.navigateToFolder(this.currentFolderUuid);
        }
      }
    } catch (error) {
      console.error('Failed to uncategorize workflow:', error);
    }
  }

  // ─── Render: Breadcrumb bar ─────────────────────────────────

  private renderBreadcrumbBar() {
    if (this.categories.length === 0) return nothing;

    return html`
      <div class="breadcrumb-bar">
        <button
          class="breadcrumb-segment root ${this.dragOverFolderUuid === '__root__' ? 'drag-over' : ''}"
          @click=${() => this.navigateToRoot()}
          @dragover=${(e: DragEvent) => this.handleBreadcrumbRootDragOver(e)}
          @dragleave=${this.handleBreadcrumbRootDragLeave}
          @drop=${(e: DragEvent) => this.handleBreadcrumbRootDrop(e)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Root
        </button>
        ${this.currentPath.map((folder, index) => html`
          <span class="breadcrumb-separator">/</span>
          <button
            class="breadcrumb-segment ${index === this.currentPath.length - 1 ? 'active' : ''}"
            @click=${() => this.navigateToBreadcrumb(index)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            ${folder.name}
          </button>
        `)}
      </div>
    `;
  }

  // ─── Render: Context menu ───────────────────────────────────

  private renderContextMenu() {
    if (!this.contextMenuTarget) return nothing;

    const uuid = this.contextMenuTarget.uuid;

    return html`
      <div
        class="context-menu"
        style="left: ${this.contextMenuPos.x}px; top: ${this.contextMenuPos.y}px;"
        @click=${(e: Event) => e.stopPropagation()}
      >
        <button class="context-menu-item" @click=${() => this.handleStartRenameFolder(uuid)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
          Rename
        </button>
        <button
          class="context-menu-item danger"
          @click=${() => this.handleDeleteFolder(uuid)}
          ?disabled=${this.isDeletingFolder}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          ${this.isDeletingFolder ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    `;
  }

  // ─── Render: Folder items ───────────────────────────────────

  private getFolderWorkflowCount(folderUuid: string): number {
    let count = 0;
    for (const [, catUuid] of this.categoryResourceMap) {
      if (catUuid === folderUuid) count++;
    }
    return count;
  }

  private renderFolderCard(folder: Category) {
    const isRenaming = this.renamingFolderUuid === folder.uuid;
    const isDragOver = this.dragOverFolderUuid === folder.uuid;
    const childCount = (folder.children?.length ?? 0);
    const workflowCount = this.getFolderWorkflowCount(folder.uuid);
    const itemCount = childCount + workflowCount;

    if (isRenaming) {
      return html`
        <div class="folder-card renaming">
          <svg class="folder-card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <input
            class="rename-folder-input"
            type="text"
            .value=${this.renameFolderName}
            @input=${this.handleRenameFolderInput}
            @keydown=${this.handleRenameFolderKeydown}
            @blur=${this.handleRenameFolderBlur}
          />
        </div>
      `;
    }

    return html`
      <div
        class="folder-card ${isDragOver ? 'folder-drop-target' : ''}"
        @click=${() => this.navigateToFolder(folder.uuid)}
        @contextmenu=${(e: MouseEvent) => this.handleFolderContextMenu(e, folder.uuid)}
        @dragover=${(e: DragEvent) => this.handleFolderDragOver(e, folder.uuid)}
        @dragleave=${this.handleFolderDragLeave}
        @drop=${(e: DragEvent) => this.handleFolderDrop(e, folder.uuid)}
      >
        <svg class="folder-card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span class="folder-card-name">${folder.name}</span>
        <span class="folder-item-count">${itemCount} item${itemCount !== 1 ? 's' : ''}</span>
      </div>
    `;
  }

  // ─── Render: New folder input ───────────────────────────────

  private renderNewFolderInput() {
    if (!this.showNewFolderInput) return nothing;

    return html`
      <div class="new-folder-input-container">
        <svg class="folder-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <input
          class="new-folder-input"
          type="text"
          placeholder="Folder name..."
          .value=${this.newFolderName}
          @input=${this.handleNewFolderNameInput}
          @keydown=${this.handleCreateFolderKeydown}
          @blur=${this.handleNewFolderBlur}
          ?disabled=${this.isCreatingFolder}
        />
      </div>
    `;
  }

  // ─── Existing render methods ─────────────────────────────────

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        <h3 class="empty-state-title">No workflows yet</h3>
        <p class="empty-state-description">
          Create workflows in your applications to automate processes and handle events.
        </p>
        <div style="margin-top: 16px;">
          ${this.renderCreateButton()}
        </div>
      </div>
    `;
  }

  private renderCreateOptionsMenu() {
    return html`
      <div class="create-options-menu">
        <div class="create-option" @click=${this.handleSelectFromTemplate}>
          <div class="create-option-icon">
            <nr-icon name="layout-template"></nr-icon>
          </div>
          <div class="create-option-content">
            <span class="create-option-title">From Template</span>
            <span class="create-option-description">Start with a pre-built workflow</span>
          </div>
        </div>
        <div class="create-option" @click=${this.handleSelectBlankWorkflow}>
          <div class="create-option-icon">
            <nr-icon name="plus"></nr-icon>
          </div>
          <div class="create-option-content">
            <span class="create-option-title">Blank Workflow</span>
            <span class="create-option-description">Start from scratch</span>
          </div>
        </div>
      </div>
    `;
  }

  private renderBlankForm() {
    return html`
      <div class="create-workflow-form blank-form-container">
        <button class="dropdown-back-button" @click=${this.handleBackToOptions}>
          <nr-icon name="chevron-left"></nr-icon>
          Back
        </button>
        <div class="dropdown-form-header">New Blank Workflow</div>
        <div class="form-field">
          <label class="form-label">Name</label>
          <nr-input
            placeholder="Enter workflow name"
            size="small"
            .value=${this.workflowName}
            @nr-input=${this.handleNameInput}
          ></nr-input>
        </div>
        <div class="form-field">
          <label class="form-label">Application <span class="optional-label">(optional)</span></label>
          <nr-select
            placeholder="Select application"
            size="small"
            .options=${this.getAppOptions()}
          ></nr-select>
        </div>
        <div class="dropdown-form-actions">
          <nr-button type="default" size="small" @click=${this.closeCreateDropdown}>Cancel</nr-button>
          <nr-button
            type="primary"
            size="small"
            ?disabled=${!this.workflowName.trim() || this.isCreating}
            @click=${this.handleCreateWorkflow}
          >${this.isCreating ? 'Creating...' : 'Create'}</nr-button>
        </div>
      </div>
    `;
  }

  private renderCreateButton() {
    return html`
      <nr-dropdown
        trigger="click"
        placement="bottom-end"
        ?open=${this.showCreateDropdown}
        @nr-dropdown-open=${() => this.showCreateDropdown = true}
        @nr-dropdown-close=${this.closeCreateDropdown}
        close-on-outside-click
        close-on-escape
        min-width="280px"
        allow-overflow
      >
        <nr-button
          slot="trigger"
          type="primary"
          size="small"
          iconLeft="Plus"
        >Create Workflow</nr-button>
        <div slot="content">
          ${this.showBlankForm ? this.renderBlankForm() : this.renderCreateOptionsMenu()}
        </div>
      </nr-dropdown>
    `;
  }

  private renderTemplateModal() {
    if (!this.showTemplateModal) return nothing;

    return html`
      <div class="template-modal-overlay" @click=${this.closeTemplateModal}>
        <div class="template-modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="template-modal-header">
            <h2 class="template-modal-title">Choose a Template</h2>
            <button class="template-modal-close" @click=${this.closeTemplateModal}>
              <nr-icon name="x"></nr-icon>
            </button>
          </div>
          <div class="template-modal-body">
            <div class="template-app-select">
              <label class="form-label">Application</label>
              <nr-select
                placeholder="Select application"
                size="small"
                .options=${this.getAppOptions()}
              ></nr-select>
            </div>
            ${this.userTemplates.length > 0 ? html`
              <h3 class="template-section-title">My Templates</h3>
              <div class="template-grid">
                ${this.userTemplates.map(template => html`
                  <div
                    class="template-card ${this.selectedUserTemplate?.uuid === template.uuid ? 'selected' : ''}"
                    @click=${() => this.handleUserTemplateSelect(template)}
                  >
                    <div class="template-card-icon user-template">
                      <nr-icon name="layout-template"></nr-icon>
                    </div>
                    <h3 class="template-card-name">${template.name}</h3>
                    <p class="template-card-description">${template.applicationName}</p>
                    <div class="template-card-meta">
                      <span class="template-card-category">Custom</span>
                      <span class="template-card-nodes">${template.nodes?.length || 0} nodes</span>
                    </div>
                  </div>
                `)}
              </div>
            ` : nothing}
            <h3 class="template-section-title">Built-in Templates</h3>
            <div class="template-grid">
              ${WORKFLOW_TEMPLATES.map(template => html`
                <div
                  class="template-card ${this.selectedTemplate?.id === template.id ? 'selected' : ''}"
                  @click=${() => this.handleTemplateSelect(template)}
                >
                  <div class="template-card-icon">
                    <nr-icon name="${template.icon}"></nr-icon>
                  </div>
                  <h3 class="template-card-name">${template.name}</h3>
                  <p class="template-card-description">${template.description}</p>
                  <div class="template-card-meta">
                    <span class="template-card-category">${template.category}</span>
                    <span class="template-card-nodes">${template.nodes.length} nodes</span>
                  </div>
                </div>
              `)}
            </div>
          </div>
          <div class="template-modal-footer">
            <nr-button type="default" size="small" @click=${this.closeTemplateModal}>
              Cancel
            </nr-button>
            <nr-button
              type="primary"
              size="small"
              ?disabled=${(!this.selectedTemplate && !this.selectedUserTemplate) || this.isCreating}
              @click=${this.handleCreateFromTemplate}
            >
              ${this.isCreating ? 'Creating...' : 'Use Template'}
            </nr-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderWorkflowCard(workflow: WorkflowWithAppName, showUnpinButton = false) {
    return html`
      <nr-card
        draggable="true"
        @dragstart=${(e: DragEvent) => this.handleWorkflowDragStart(e, workflow)}
        @click=${() => this.handleRowClick(workflow)}
      >
        <div slot="content">
          <div class="card-header">
            <h3 class="card-name" title=${workflow.name}>${workflow.name}</h3>
            ${showUnpinButton ? html`
              <nr-icon
                name="star"
                class="unpin-icon"
                title="Unpin workflow"
                @click=${(e: Event) => this.handlePin(e, workflow)}
              ></nr-icon>
            ` : html`
              <nr-icon
                name="star"
                class="pin-icon"
                title="Pin workflow"
                @click=${(e: Event) => this.handlePin(e, workflow)}
              ></nr-icon>
            `}
          </div>

          <div class="card-meta">
            <span class="workflow-app">${workflow.applicationName || 'Unknown'}</span>
            ${workflow.isTemplate ? html`<nr-tag size="small" status="info">Template</nr-tag>` : nothing}
            <span class="status-badge ${workflow.status === 'active' ? 'active' : 'inactive'}">
              <span class="status-dot"></span>
              ${workflow.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div class="card-footer">
            <div class="meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>${formatDate(workflow.updatedAt)}</span>
            </div>

            <div class="card-actions">
              <nr-button type="default" size="small" iconLeft="Play" @click=${(e: Event) => this.handleRun(e, workflow)}>
                Run
              </nr-button>
              <nr-button type="primary" size="small" iconLeft="Pencil" @click=${(e: Event) => this.handleEdit(e, workflow)}>
                Edit
              </nr-button>
            </div>
          </div>
        </div>
      </nr-card>
    `;
  }

  private renderCardsGrid(workflows: WorkflowWithAppName[], showUnpinButton = false) {
    if (workflows.length === 0) return nothing;

    return html`
      <div class="pinned-grid">
        ${workflows.map(workflow => this.renderWorkflowCard(workflow, showUnpinButton))}
      </div>
    `;
  }

  private renderFolderContents() {
    const folders = this.displayFolders;
    const folderWorkflows = this.currentFolderWorkflows;
    const insideFolder = this.currentFolderUuid !== null;
    const hasContent = folders.length > 0 || this.showNewFolderInput || (insideFolder && folderWorkflows.length > 0);

    if (!hasContent) return nothing;

    return html`
      <div class="pinned-grid">
        ${folders.map(folder => this.renderFolderCard(folder))}
        ${this.showNewFolderInput ? html`
          <div class="folder-card new-folder">
            <svg class="folder-card-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <input
              class="new-folder-input"
              type="text"
              placeholder="Folder name..."
              .value=${this.newFolderName}
              @input=${this.handleNewFolderNameInput}
              @keydown=${this.handleCreateFolderKeydown}
              @blur=${this.handleNewFolderBlur}
              ?disabled=${this.isCreatingFolder}
            />
          </div>
        ` : nothing}
        ${insideFolder ? folderWorkflows.map(workflow => this.renderWorkflowCard(workflow)) : nothing}
      </div>
    `;
  }

  private renderSection(title: string, workflows: WorkflowWithAppName[], status: 'success' | 'warning' | 'default', asCards = false, showUnpinButton = false) {
    if (workflows.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">${title}</h2>
          <nr-tag size="small" status=${status}>${workflows.length}</nr-tag>
        </div>
        ${asCards ? this.renderCardsGrid(workflows, showUnpinButton) : html`
          <div class="table-container">
            <nr-table
              .headers=${this.getTableHeaders()}
              .rows=${workflows}
              size="small"
              emptyText="No workflows found"
              clickable
              @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
            ></nr-table>
          </div>
        `}
      </div>
    `;
  }

  render() {
    const pinned = this.allPinnedWorkflows;
    const displayWfs = this.unpinnedDisplayWorkflows;
    const hasPinned = pinned.length > 0;
    const showAsCards = this.viewMode === 'cards';
    const folders = this.displayFolders;
    const hasFolders = folders.length > 0;

    return html`
      ${this.workflows.length === 0
        ? this.renderEmptyState()
        : html`
              <div class="list-header">
                <nr-radio-group
                  type="button"
                  size="small"
                  direction="horizontal"
                  auto-width
                  .options=${this.viewModeOptions}
                  .value=${this.viewMode}
                  @nr-change=${this.handleViewModeChange}
                ></nr-radio-group>
                <button
                  class="new-folder-btn"
                  @click=${this.handleShowNewFolderInput}
                  title="New Folder"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                  </svg>
                  New Folder
                </button>
                ${this.renderCreateButton()}
              </div>
              <div class="sections-container">
                ${hasFolders || this.showNewFolderInput || (this.currentFolderUuid !== null && this.currentFolderWorkflows.length > 0) || this.categories.length > 0 ? html`
                  <div class="folder-container ${this.folderSectionVisible ? '' : 'collapsed'}">
                    <div class="folder-container-header">
                      <button
                        class="folder-toggle-btn"
                        @click=${() => toggleFolderSectionVisible()}
                        title=${this.folderSectionVisible ? 'Hide folders' : 'Show folders'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="${this.folderSectionVisible ? 'M19 9l-7 7-7-7' : 'M9 18l6-6-6-6'}"></path>
                        </svg>
                        Folders
                      </button>
                      ${this.renderBreadcrumbBar()}
                    </div>
                    ${this.folderSectionVisible ? html`
                      ${this.loadingFolder ? html`<div class="loading-folder">Loading...</div>` : nothing}
                      ${this.renderFolderContents()}
                    ` : nothing}
                  </div>
                ` : nothing}

                ${hasPinned ? html`
                  ${this.renderSection('Pinned', pinned, 'success', true, true)}
                ` : nothing}

                ${showAsCards ? html`
                  ${displayWfs.length > 0 ? html`
                    <div class="section">
                      <div class="section-header">
                        <h2 class="section-title">Workflows</h2>
                        <nr-tag size="small" status="default">${displayWfs.length}</nr-tag>
                      </div>
                      ${this.renderCardsGrid(displayWfs, false)}
                    </div>
                  ` : nothing}
                ` : html`
                  ${displayWfs.length > 0 ? html`
                    <div class="section">
                      <div class="section-header">
                        <h2 class="section-title">Workflows</h2>
                        <nr-tag size="small" status="default">${displayWfs.length}</nr-tag>
                      </div>
                      <div class="table-container">
                        <nr-table
                          .headers=${this.getTableHeaders()}
                          .rows=${displayWfs}
                          size="small"
                          emptyText="No workflows found"
                          clickable
                          @nr-row-click=${(e: CustomEvent) => this.handleRowClick(e.detail.row)}
                        ></nr-table>
                      </div>
                    </div>
                  ` : nothing}
                `}
              </div>
            `
      }
      ${this.renderTemplateModal()}
      ${this.renderContextMenu()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflows-list': WorkflowsList;
  }
}
