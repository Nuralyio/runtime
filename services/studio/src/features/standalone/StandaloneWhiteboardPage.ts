/**
 * Standalone Whiteboard Page
 * A whiteboard canvas editor that can be accessed directly via URL.
 * Route: /dashboard/whiteboard/edit/{whiteboardId}
 *
 * Follows the same pattern as StandaloneWorkflowPage, reusing <workflow-canvas>
 * with canvasType='WHITEBOARD'.
 */

import { customElement, property, state } from 'lit/decorators.js';
import { html, LitElement, css } from 'lit';
import '../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.component';
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  CanvasViewport,
} from '../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  CanvasType,
  WhiteboardNodeType,
  PortType,
  NODE_ICONS,
  NODE_COLORS,
} from '../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  createViewportDebouncer,
  getDefaultViewport,
  type ViewportDebouncer,
} from '../../utils/workflow-utils';
import { whiteboardService, type WhiteboardDTO, type WhiteboardElementDTO, type WhiteboardConnectorDTO } from '../../services/whiteboard.service';
import { setKvEntry, getKvEntry } from '../runtime/redux/store/kv';

type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';

/** Map backend elementType string to WhiteboardNodeType */
const ELEMENT_TYPE_TO_NODE_TYPE: Record<string, WhiteboardNodeType> = {
  'STICKY_NOTE': WhiteboardNodeType.STICKY_NOTE,
  'SHAPE_RECTANGLE': WhiteboardNodeType.SHAPE_RECTANGLE,
  'SHAPE_CIRCLE': WhiteboardNodeType.SHAPE_CIRCLE,
  'SHAPE_DIAMOND': WhiteboardNodeType.SHAPE_DIAMOND,
  'SHAPE_TRIANGLE': WhiteboardNodeType.SHAPE_TRIANGLE,
  'SHAPE_ARROW': WhiteboardNodeType.SHAPE_ARROW,
  'SHAPE_LINE': WhiteboardNodeType.SHAPE_LINE,
  'SHAPE_STAR': WhiteboardNodeType.SHAPE_STAR,
  'SHAPE_HEXAGON': WhiteboardNodeType.SHAPE_HEXAGON,
  'TEXT_BLOCK': WhiteboardNodeType.TEXT_BLOCK,
  'IMAGE': WhiteboardNodeType.IMAGE,
  'DRAWING': WhiteboardNodeType.DRAWING,
  'FRAME': WhiteboardNodeType.FRAME,
  'VOTING': WhiteboardNodeType.VOTING,
};

/** Reverse map: WhiteboardNodeType → backend elementType string */
const NODE_TYPE_TO_ELEMENT_TYPE: Record<string, string> = {};
for (const [backendType, nodeType] of Object.entries(ELEMENT_TYPE_TO_NODE_TYPE)) {
  NODE_TYPE_TO_ELEMENT_TYPE[nodeType] = backendType;
}

function elementToNode(el: WhiteboardElementDTO): WorkflowNode {
  const nodeType = ELEMENT_TYPE_TO_NODE_TYPE[el.elementType] || WhiteboardNodeType.SHAPE_RECTANGLE;
  return {
    id: el.id,
    name: el.name || el.elementType,
    type: nodeType,
    position: { x: el.positionX, y: el.positionY },
    configuration: {
      width: el.width,
      height: el.height,
      zIndex: el.zIndex,
      rotation: el.rotation,
      opacity: el.opacity,
      textContent: el.textContent,
      backgroundColor: el.backgroundColor,
      borderColor: el.borderColor,
      borderWidth: el.borderWidth,
      borderRadius: el.borderRadius,
      fontSize: el.fontSize,
      fontFamily: el.fontFamily,
      fontWeight: el.fontWeight,
      textColor: el.textColor,
      textAlign: el.textAlign,
      imageUrl: el.imageUrl,
      fillColor: el.fillColor,
      shapeType: el.shapeType,
      pathData: el.pathData,
      // Frame-specific fields
      ...(nodeType === WhiteboardNodeType.FRAME ? {
        frameLabel: el.name || 'Group',
        frameWidth: el.width,
        frameHeight: el.height,
        frameBackgroundColor: el.backgroundColor || 'rgba(99, 102, 241, 0.05)',
        frameBorderColor: el.borderColor || 'rgba(99, 102, 241, 0.3)',
        frameLabelPosition: 'top-left',
        frameLabelPlacement: 'outside',
        frameShowLabel: true,
        frameCollapsed: false,
      } : {}),
    },
    ports: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
    metadata: {
      icon: NODE_ICONS[nodeType],
      color: NODE_COLORS[nodeType],
    },
  };
}

function connectorToEdge(conn: WhiteboardConnectorDTO): WorkflowEdge {
  return {
    id: conn.id,
    sourceNodeId: conn.sourceElementId,
    sourcePortId: conn.sourcePortId || 'out',
    targetNodeId: conn.targetElementId,
    targetPortId: conn.targetPortId || 'in',
    label: conn.label,
  };
}

function nodeToElementDTO(node: WorkflowNode, whiteboardId: string): Partial<WhiteboardElementDTO> {
  const config = node.configuration || {};
  const backendType = NODE_TYPE_TO_ELEMENT_TYPE[node.type] || 'SHAPE_RECTANGLE';
  return {
    id: node.id,
    whiteboardId,
    elementType: backendType,
    name: node.name,
    positionX: node.position.x,
    positionY: node.position.y,
    width: (config.frameWidth as number) || (config.width as number) || 200,
    height: (config.frameHeight as number) || (config.height as number) || 200,
    zIndex: config.zIndex as number | undefined,
    rotation: config.rotation as number | undefined,
    opacity: config.opacity as number | undefined,
    textContent: config.textContent as string | undefined,
    backgroundColor: config.backgroundColor as string | undefined,
    borderColor: config.borderColor as string | undefined,
    borderWidth: config.borderWidth as number | undefined,
    borderRadius: config.borderRadius as number | undefined,
    fontSize: config.fontSize as number | undefined,
    fontFamily: config.fontFamily as string | undefined,
    fontWeight: config.fontWeight as string | undefined,
    textColor: config.textColor as string | undefined,
    textAlign: config.textAlign as string | undefined,
    imageUrl: config.imageUrl as string | undefined,
    fillColor: config.fillColor as string | undefined,
    shapeType: config.shapeType as string | undefined,
    pathData: config.pathData as string | undefined,
  };
}

@customElement('standalone-whiteboard-page')
export class StandaloneWhiteboardPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .standalone-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--n-color-surface-secondary, #f9fafb);
    }

    .standalone-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      gap: 16px;
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .back-link {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--n-color-text-secondary, #6b7280);
      background: transparent;
      border: 1px solid var(--n-color-border, #e5e7eb);
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .back-link:hover {
      color: var(--n-color-text, #111827);
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .back-link svg {
      width: 14px;
      height: 14px;
    }

    .whiteboard-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .whiteboard-name {
      font-weight: 600;
      font-size: 16px;
      color: var(--n-color-text, #111827);
      margin: 0;
    }

    .save-status {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .save-status.saved {
      color: var(--n-color-success, #22c55e);
      background: var(--n-color-success-bg, #f0fdf4);
    }

    .save-status.saving {
      color: var(--n-color-warning, #f59e0b);
      background: var(--n-color-warning-bg, #fffbeb);
    }

    .save-status.dirty {
      color: var(--n-color-info, #3b82f6);
      background: var(--n-color-info-bg, #eff6ff);
    }

    .save-status.error {
      color: var(--n-color-error, #ef4444);
      background: var(--n-color-error-bg, #fef2f2);
    }

    .toolbar-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .toolbar-button.secondary {
      background: var(--n-color-surface, #fff);
      color: var(--n-color-text, #111827);
      border: 1px solid var(--n-color-border, #e5e7eb);
    }

    .toolbar-button.secondary:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .canvas-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    workflow-canvas {
      width: 100%;
      height: 100%;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      z-index: 100;
      gap: 12px;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--n-color-border, #e5e7eb);
      border-top-color: var(--n-color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      font-size: 14px;
      color: var(--n-color-text-secondary, #6b7280);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .error-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      color: var(--n-color-error, #ef4444);
    }

    .error-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--n-color-text, #111827);
      margin-bottom: 8px;
    }

    .error-message {
      font-size: 14px;
      color: var(--n-color-text-secondary, #6b7280);
      max-width: 400px;
    }
  `;

  /** The whiteboard ID to load */
  @property({ type: String, attribute: 'whiteboard-id' })
  whiteboardId: string = '';

  @state()
  private whiteboardData: WhiteboardDTO | null = null;

  @state()
  private workflow: Workflow | null = null;

  @state()
  private loading = true;

  @state()
  private loadError: string | null = null;

  @state()
  private saveStatus: SaveStatus = 'saved';

  private viewportDebouncer: ViewportDebouncer | null = null;
  private currentViewport: CanvasViewport = getDefaultViewport();
  private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSavedWorkflow: Workflow | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.loadWhiteboard();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.viewportDebouncer) {
      this.viewportDebouncer.cancel();
    }
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }
  }

  private async loadWhiteboard(): Promise<void> {
    if (!this.whiteboardId) {
      this.loadError = 'No whiteboard ID provided';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.loadError = null;

    try {
      const wb = await whiteboardService.getWhiteboard(this.whiteboardId);

      if (!wb) {
        this.loadError = 'Whiteboard not found';
        this.loading = false;
        return;
      }

      this.whiteboardData = wb;

      // Load viewport from KV
      const viewport = await this.loadViewport(wb.applicationId);
      this.currentViewport = viewport || getDefaultViewport();

      // Convert whiteboard DTO → Workflow model
      const nodes: WorkflowNode[] = (wb.elements || []).map(elementToNode);
      const edges: WorkflowEdge[] = (wb.connectors || []).map(connectorToEdge);

      this.workflow = {
        id: wb.id,
        name: wb.name,
        description: wb.description,
        applicationId: wb.applicationId,
        nodes,
        edges,
        viewport: this.currentViewport,
      };

      this.lastSavedWorkflow = JSON.parse(JSON.stringify(this.workflow));

      // Setup viewport debouncer
      this.viewportDebouncer = createViewportDebouncer((v) => this.saveViewport(v));

      this.loading = false;
    } catch (error: any) {
      console.error('[StandaloneWhiteboard] Failed to load whiteboard:', error);
      this.loadError = error.message || 'Failed to load whiteboard';
      this.loading = false;
    }
  }

  private buildViewportKeyPath(): string {
    return `_user_prefs/whiteboard_viewport/${this.whiteboardId}`;
  }

  private async loadViewport(applicationId?: string): Promise<CanvasViewport | null> {
    try {
      const appId = applicationId || '_standalone';
      const keyPath = this.buildViewportKeyPath();
      const entry = await getKvEntry(appId, keyPath);
      return entry?.value as CanvasViewport || null;
    } catch {
      return null;
    }
  }

  private async saveViewport(viewport: CanvasViewport): Promise<void> {
    try {
      const appId = this.whiteboardData?.applicationId || '_standalone';
      const keyPath = this.buildViewportKeyPath();
      await setKvEntry(keyPath, {
        applicationId: appId,
        scope: 'user',
        value: viewport,
        isSecret: false,
      });
    } catch (error) {
      console.error('[StandaloneWhiteboard] Failed to save viewport:', error);
    }
  }

  private handleCanvasWorkflowChanged(event: CustomEvent<{ workflow: Workflow }>): void {
    if (!this.whiteboardId) return;

    const { workflow } = event.detail;
    this.workflow = {
      ...workflow,
      id: this.whiteboardId,
      applicationId: this.whiteboardData?.applicationId,
      viewport: this.currentViewport,
    };
    this.saveStatus = 'dirty';
    this.saveWhiteboardDebounced();
  }

  private handleViewportChanged(event: CustomEvent<{ viewport: CanvasViewport }>): void {
    const { viewport } = event.detail;
    this.currentViewport = viewport;

    if (this.viewportDebouncer) {
      this.viewportDebouncer.update(viewport);
    }
  }

  private saveWhiteboardDebounced(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.saveWhiteboard();
    }, 500);
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private async saveWhiteboard(): Promise<void> {
    if (!this.workflow || !this.whiteboardId) return;

    this.saveStatus = 'saving';

    try {
      // Update whiteboard metadata (name, description)
      await whiteboardService.updateWhiteboard(this.whiteboardId, {
        name: this.workflow.name,
        description: this.workflow.description,
      });

      // Sync elements
      await this.syncElements();

      this.lastSavedWorkflow = JSON.parse(JSON.stringify(this.workflow));
      this.saveStatus = 'saved';
    } catch (error) {
      console.error('[StandaloneWhiteboard] Save error:', error);
      this.saveStatus = 'error';
    }
  }

  private async syncElements(): Promise<void> {
    if (!this.workflow || !this.lastSavedWorkflow) return;

    const nodeIdMap = new Map<string, string>();

    const oldNodes = this.lastSavedWorkflow.nodes || [];
    const newNodes = this.workflow.nodes || [];
    const oldNodeIds = new Set(oldNodes.map((n) => n.id));
    const newNodeIds = new Set(newNodes.map((n) => n.id));

    // Add new elements
    for (const node of newNodes) {
      if (!oldNodeIds.has(node.id) || !this.isValidUUID(node.id)) {
        const elementDTO = nodeToElementDTO(node, this.whiteboardId);
        const saved = await whiteboardService.addElement(this.whiteboardId, elementDTO);
        nodeIdMap.set(node.id, saved.id);
      }
    }

    // Update existing elements
    for (const node of newNodes) {
      if (oldNodeIds.has(node.id) && this.isValidUUID(node.id)) {
        const oldNode = oldNodes.find((n) => n.id === node.id);
        if (oldNode && JSON.stringify(oldNode) !== JSON.stringify(node)) {
          const elementDTO = nodeToElementDTO(node, this.whiteboardId);
          try {
            await whiteboardService.updateElement(this.whiteboardId, node.id, elementDTO);
          } catch (error: any) {
            if (error.message?.includes('404') || error.message?.includes('not found')) {
              const saved = await whiteboardService.addElement(this.whiteboardId, elementDTO);
              nodeIdMap.set(node.id, saved.id);
            } else {
              throw error;
            }
          }
        }
      }
    }

    // Delete removed elements
    for (const oldNode of oldNodes) {
      if (!newNodeIds.has(oldNode.id) && this.isValidUUID(oldNode.id)) {
        await whiteboardService.deleteElement(this.whiteboardId, oldNode.id);
      }
    }

    // Update local workflow with server-generated UUIDs
    if (nodeIdMap.size > 0) {
      const updatedNodes = this.workflow.nodes.map((node) => ({
        ...node,
        id: nodeIdMap.get(node.id) || node.id,
      }));
      const updatedEdges = this.workflow.edges.map((edge) => ({
        ...edge,
        sourceNodeId: nodeIdMap.get(edge.sourceNodeId) || edge.sourceNodeId,
        targetNodeId: nodeIdMap.get(edge.targetNodeId) || edge.targetNodeId,
      }));
      this.workflow = { ...this.workflow, nodes: updatedNodes, edges: updatedEdges };
    }
  }

  private async handleManualSave(): Promise<void> {
    await this.saveWhiteboard();
  }

  private getSaveStatusLabel(): string {
    switch (this.saveStatus) {
      case 'saved': return 'Saved';
      case 'saving': return 'Saving...';
      case 'dirty': return 'Unsaved changes';
      case 'error': return 'Save failed';
      default: return '';
    }
  }

  private getBackUrl(): string {
    return `/dashboard/whiteboard/${this.whiteboardId}`;
  }

  override render() {
    if (this.loading) {
      return html`
        <div class="standalone-container">
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <span class="loading-text">Loading whiteboard...</span>
          </div>
        </div>
      `;
    }

    if (this.loadError) {
      return html`
        <div class="standalone-container">
          <div class="standalone-header">
            <div class="header-left">
              <a href="/dashboard/whiteboards" class="back-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Whiteboards
              </a>
            </div>
          </div>
          <div class="error-container">
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <h2 class="error-title">Unable to Load Whiteboard</h2>
            <p class="error-message">${this.loadError}</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="standalone-container">
        <div class="standalone-header">
          <div class="header-left">
            <a href=${this.getBackUrl()} class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </a>
            <div class="whiteboard-info">
              <h1 class="whiteboard-name">${this.workflow?.name || 'Whiteboard'}</h1>
              <span class="save-status ${this.saveStatus}">${this.getSaveStatusLabel()}</span>
            </div>
          </div>
          <div class="header-right">
            <button
              class="toolbar-button secondary"
              @click=${this.handleManualSave}
              ?disabled=${this.saveStatus === 'saving'}
            >
              Save
            </button>
          </div>
        </div>

        <div class="canvas-container">
          <workflow-canvas
            .workflow=${this.workflow}
            .canvasType=${'WHITEBOARD'}
            @workflow-changed=${this.handleCanvasWorkflowChanged}
            @viewport-changed=${this.handleViewportChanged}
          ></workflow-canvas>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'standalone-whiteboard-page': StandaloneWhiteboardPage;
  }
}
