/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  WorkflowNode,
  NodePort,
  PortType,
  ExecutionStatus,
  TriggerConnectionState,
  NODE_COLORS,
  NODE_ICONS,
  isAgentNode,
  isNoteNode,
  WorkflowNodeType,
  DbDesignerNodeType,
} from './workflow-canvas.types.js';
import { styles } from './workflow-node.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import '../icon/icon.component.js';
import '../button/button.component.js';

/**
 * Workflow node component for displaying individual nodes in the canvas
 *
 * @element workflow-node
 * @fires node-mousedown - When node is clicked for dragging
 * @fires port-mousedown - When a port is clicked to start connection
 * @fires port-mouseup - When mouse is released on a port
 * @fires node-dblclick - When node is double-clicked for editing
 * @fires node-preview - When preview button is clicked (for chatbot nodes)
 * @fires node-trigger - When trigger button is clicked (for start nodes)
 */
@customElement('workflow-node')
export class WorkflowNodeElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  @property({ type: Object })
  node!: WorkflowNode;

  @property({ type: Boolean })
  selected = false;

  @property({ type: Boolean })
  dragging = false;

  @property({ type: String })
  connectingPortId: string | null = null;

  @property({ type: Boolean })
  editing = false;

  @property({ type: Object })
  remoteSelection: { userId: string; color: string; username: string } | null = null;

  @property({ type: Object })
  remoteTyping: { userId: string; username: string; color: string } | null = null;

  @state()
  private hoveredPort: string | null = null;

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    // Focus textarea when entering edit mode
    if (changedProperties.has('editing') && this.editing) {
      const textarea = this.shadowRoot?.querySelector('.note-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }
  }

  private getNodeColor(): string {
    return this.node.metadata?.color || NODE_COLORS[this.node.type] || '#3b82f6';
  }

  private getNodeIcon(): string {
    return this.node.metadata?.icon || NODE_ICONS[this.node.type] || 'box';
  }

  private handleNodeMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('port')) return;
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('node-mousedown', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  private handleNodeDblClick(e: MouseEvent) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('node-dblclick', {
      detail: { node: this.node },
      bubbles: true,
      composed: true,
    }));
  }

  private handlePreviewClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('node-preview', {
      detail: { node: this.node },
      bubbles: true,
      composed: true,
    }));
  }

  private isChatbotNode(): boolean {
    return this.node.type === WorkflowNodeType.CHATBOT ||
           this.node.type === WorkflowNodeType.CHAT_START;
  }

  private hasPreviewPanel(): boolean {
    return this.isChatbotNode() ||
           this.node.type === WorkflowNodeType.HTTP_START;
  }

  private isStartNode(): boolean {
    return this.node.type === WorkflowNodeType.START;
  }

  private isDbTableNode(): boolean {
    return this.node.type === DbDesignerNodeType.TABLE;
  }

  private isUiTableNode(): boolean {
    return this.node.type === WorkflowNodeType.UI_TABLE;
  }

  private isNoteNode(): boolean {
    return isNoteNode(this.node.type);
  }

  private getNoteFontSize(): string {
    const fontSize = this.node.configuration?.noteFontSize || 'medium';
    switch (fontSize) {
      case 'small': return '12px';
      case 'large': return '16px';
      default: return '14px';
    }
  }

  /**
   * Render a Note node - sticky note style annotation
   */
  private renderNoteNode() {
    const config = this.node.configuration || {};
    const bgColor = config.noteBackgroundColor || '#fef08a';
    const textColor = config.noteTextColor || '#713f12';
    const content = config.noteContent || 'Add your note here...';
    const showBorder = config.noteShowBorder || false;
    const noteWidth = (config.noteWidth as number) || 200;
    const noteHeight = (config.noteHeight as number) || 100;

    const containerClasses = {
      'node-container': true,
      'note-node': true,
      selected: this.selected,
      dragging: this.dragging,
      editing: this.editing,
    };

    const containerStyles = {
      '--note-bg': bgColor,
      '--note-text': textColor,
      left: `${this.node.position.x}px`,
      top: `${this.node.position.y}px`,
    };

    const noteStyles = {
      backgroundColor: bgColor,
      color: textColor,
      fontSize: this.getNoteFontSize(),
      border: showBorder ? `1px solid ${textColor}30` : 'none',
      width: `${noteWidth}px`,
      minHeight: `${noteHeight}px`,
    };

    return html`
      <div
        class=${classMap(containerClasses)}
        style=${styleMap(containerStyles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="note-content" style=${styleMap(noteStyles)}>
          ${this.editing ? html`
            <textarea
              class="note-textarea"
              .value=${content}
              @blur=${this.handleNoteBlur}
              @keydown=${this.handleNoteKeydown}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              @dblclick=${(e: MouseEvent) => e.stopPropagation()}
              style="color: ${textColor}; font-size: ${this.getNoteFontSize()};"
            ></textarea>
          ` : html`
            <span class="note-text">${content}</span>
          `}
        </div>
        <!-- Settings button -->
        <button
          class="note-settings-btn"
          title="Note settings"
          @click=${this.handleNoteSettingsClick}
          @mousedown=${(e: MouseEvent) => e.stopPropagation()}
        >
          <nr-icon name="settings" size="small"></nr-icon>
        </button>
        <!-- Resize handle -->
        ${this.selected ? html`
          <div
            class="note-resize-handle"
            @mousedown=${this.handleNoteResizeStart}
          ></div>
        ` : nothing}
      </div>
    `;
  }

  private handleNoteBlur(e: FocusEvent) {
    const textarea = e.target as HTMLTextAreaElement;
    this.dispatchEvent(new CustomEvent('note-content-change', {
      detail: { node: this.node, content: textarea.value },
      bubbles: true,
      composed: true,
    }));
    this.dispatchEvent(new CustomEvent('note-edit-end', {
      detail: { node: this.node },
      bubbles: true,
      composed: true,
    }));
  }

  private handleNoteKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('note-edit-end', {
        detail: { node: this.node },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private handleNoteResizeStart(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('note-resize-start', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  private handleNoteSettingsClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    // Dispatch the same event as double-click to open config panel
    // but use a specific event for note settings
    this.dispatchEvent(new CustomEvent('note-settings', {
      detail: { node: this.node },
      bubbles: true,
      composed: true,
    }));
  }

  private getTriggerStateLabel(): string {
    const state = this.node.triggerStatus?.connectionState;
    switch (state) {
      case TriggerConnectionState.CONNECTED: return 'Connected';
      case TriggerConnectionState.CONNECTING: return 'Connecting...';
      case TriggerConnectionState.DISCONNECTED: return 'Disconnected';
      case TriggerConnectionState.PAUSED: return 'Paused';
      case TriggerConnectionState.HANDOFF_PENDING: return 'Handing off...';
      case TriggerConnectionState.ERROR:
        return this.node.triggerStatus?.stateReason
          ? `Error: ${this.node.triggerStatus.stateReason}`
          : 'Error';
      default: return 'Unknown';
    }
  }

  private renderTriggerStatus() {
    const ts = this.node.triggerStatus;
    if (!ts) return nothing;

    const dotClass = ts.connectionState.toLowerCase();

    return html`
      <div class="trigger-status">
        <span class="trigger-status-dot ${dotClass}"></span>
        <span class="trigger-status-text">${this.getTriggerStateLabel()}</span>
        ${ts.connectionState === TriggerConnectionState.CONNECTED && ts.messagesReceived != null ? html`
          <span class="trigger-msg-count">${ts.messagesReceived} msgs</span>
        ` : nothing}
      </div>
    `;
  }

  private handleTriggerClick(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('node-trigger', {
      detail: { node: this.node },
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * Get the icon for a column type
   */
  private getColumnTypeIcon(type: string): string {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('int') || typeLower.includes('serial') || typeLower.includes('numeric') || typeLower.includes('decimal') || typeLower.includes('float') || typeLower.includes('double')) {
      return 'hash';
    }
    if (typeLower.includes('date') || typeLower.includes('time')) {
      return 'calendar';
    }
    if (typeLower.includes('bool')) {
      return 'toggle-left';
    }
    if (typeLower.includes('json') || typeLower.includes('array')) {
      return 'braces';
    }
    if (typeLower.includes('text') || typeLower.includes('varchar') || typeLower.includes('char')) {
      return 'type';
    }
    if (typeLower.includes('blob') || typeLower.includes('binary')) {
      return 'file';
    }
    return 'minus';
  }

  /**
   * Render a DB Table node in ERD style
   */
  private renderDbTableNode() {
    const nodeColor = this.getNodeColor();
    const status = this.node.status || ExecutionStatus.IDLE;
    const config = this.node.configuration || {};
    const columns = (config.columns as Array<{ name: string; type: string; nullable?: boolean }>) || [];
    const primaryKey = config.primaryKey as string;

    const containerClasses = {
      'node-container': true,
      'db-table-node': true,
      selected: this.selected,
      dragging: this.dragging,
      [`status-${status.toLowerCase()}`]: true,
    };

    const containerStyles = {
      '--node-accent': nodeColor,
      left: `${this.node.position.x}px`,
      top: `${this.node.position.y}px`,
    };

    return html`
      <div
        class=${classMap(containerClasses)}
        style=${styleMap(containerStyles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="db-table-header" style="background: ${nodeColor}">
          <span class="db-table-name">${this.node.name || config.tableName || 'Table'}</span>
        </div>

        <div class="db-table-columns">
          ${columns.length === 0 ? html`
            <div class="db-table-empty">No columns defined</div>
          ` : columns.map(column => html`
            <div class="db-table-column ${column.name === primaryKey ? 'primary-key' : ''}">
              ${column.name === primaryKey ? html`
                <nr-icon name="key" size="small" class="column-key-icon"></nr-icon>
              ` : html`
                <nr-icon name=${this.getColumnTypeIcon(column.type)} size="small" class="column-type-icon"></nr-icon>
              `}
              <span class="column-name">${column.name}</span>
              ${column.nullable === false ? html`
                <span class="column-required">*</span>
              ` : nothing}
            </div>
          `)}
        </div>

        ${status !== ExecutionStatus.IDLE ? html`
          <div class="node-status">
            <span class="status-dot ${status.toLowerCase()}"></span>
            <span class="status-text">${this.getStatusText()}</span>
          </div>
        ` : nothing}

        <div class="ports-container">
          ${this.node.ports.inputs.map((port, i) =>
            this.renderPort(port, true, i, this.node.ports.inputs.length)
          )}
          ${this.node.ports.outputs.map((port, i) =>
            this.renderPort(port, false, i, this.node.ports.outputs.length)
          )}
        </div>
      </div>
    `;
  }

  /**
   * Render a UI Table node - shows configured columns on the canvas
   */
  private renderUiTableNode() {
    const nodeColor = this.getNodeColor();
    const status = this.node.status || ExecutionStatus.IDLE;
    const config = this.node.configuration || {};
    const userColumns = (config.tableColumns as Array<{ name: string; key: string }>) || [];

    // Dummy data shown when no columns are configured
    const dummyColumns = [
      { name: 'ID', key: 'id' },
      { name: 'Name', key: 'name' },
      { name: 'Email', key: 'email' },
      { name: 'Status', key: 'status' },
    ];
    const dummyRows = [
      { id: '1', name: 'Alice', email: 'alice@demo.io', status: 'Active' },
      { id: '2', name: 'Bob', email: 'bob@demo.io', status: 'Pending' },
      { id: '3', name: 'Carol', email: 'carol@demo.io', status: 'Active' },
    ];

    const hasUserColumns = userColumns.length > 0;
    const displayColumns = hasUserColumns ? userColumns : dummyColumns;

    const containerClasses = {
      'node-container': true,
      'ui-table-node': true,
      selected: this.selected,
      dragging: this.dragging,
      [`status-${status.toLowerCase()}`]: true,
    };

    const tableWidth = (config.tableWidth as number) || 320;
    const tableHeight = (config.tableHeight as number) || 200;

    const containerStyles = {
      '--node-accent': nodeColor,
      left: `${this.node.position.x}px`,
      top: `${this.node.position.y}px`,
      width: `${tableWidth}px`,
      height: `${tableHeight}px`,
    };

    return html`
      <div
        class=${classMap(containerClasses)}
        style=${styleMap(containerStyles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="ui-table-header" style="background: ${nodeColor}">
          <nr-icon name="table" size="small" style="color: white;"></nr-icon>
          <span class="ui-table-name">${this.node.name || 'Table'}</span>
        </div>

        <div class="ui-table-grid ${!hasUserColumns ? 'placeholder' : ''}">
          <!-- Column headers -->
          <div class="ui-table-row ui-table-head-row">
            ${displayColumns.map(col => html`
              <div class="ui-table-cell ui-table-head-cell">${col.name || col.key}</div>
            `)}
          </div>
          <!-- Data rows (dummy when no columns configured) -->
          ${(!hasUserColumns ? dummyRows : [{}, {}, {}]).map(row => html`
            <div class="ui-table-row">
              ${displayColumns.map(col => html`
                <div class="ui-table-cell">${!hasUserColumns ? (row as any)[col.key] || '—' : '—'}</div>
              `)}
            </div>
          `)}
        </div>

        ${!hasUserColumns ? html`
          <div class="ui-table-hint">Sample data — configure columns to customize</div>
        ` : nothing}

        ${status !== ExecutionStatus.IDLE ? html`
          <div class="node-status">
            <span class="status-dot ${status.toLowerCase()}"></span>
            <span class="status-text">${this.getStatusText()}</span>
          </div>
        ` : nothing}

        <div class="ports-container">
          ${this.node.ports.inputs.map((port, i) =>
            this.renderPort(port, true, i, this.node.ports.inputs.length)
          )}
          ${this.node.ports.outputs.map((port, i) =>
            this.renderPort(port, false, i, this.node.ports.outputs.length)
          )}
        </div>

        <!-- Resize handle -->
        ${this.selected ? html`
          <div
            class="ui-table-resize-handle"
            @mousedown=${this.handleUiTableResizeStart}
          ></div>
        ` : nothing}
      </div>
    `;
  }

  private handleUiTableResizeStart(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('table-resize-start', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  private handlePortMouseDown(e: MouseEvent, port: NodePort, isInput: boolean) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('port-mousedown', {
      detail: { node: this.node, port, isInput, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  private handlePortMouseUp(e: MouseEvent, port: NodePort, isInput: boolean) {
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('port-mouseup', {
      detail: { node: this.node, port, isInput, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  private handlePortMouseEnter(portId: string) {
    this.hoveredPort = portId;
  }

  private handlePortMouseLeave() {
    this.hoveredPort = null;
  }

  private getPortClasses(port: NodePort, isInput: boolean): Record<string, boolean> {
    return {
      port: true,
      input: isInput,
      output: !isInput,
      'conditional-true': port.type === PortType.CONDITIONAL_TRUE,
      'conditional-false': port.type === PortType.CONDITIONAL_FALSE,
      'conditional-default': port.type === PortType.CONDITIONAL_DEFAULT,
      error: port.type === PortType.ERROR,
      connecting: this.connectingPortId === port.id,
      compatible: this.connectingPortId !== null && this.connectingPortId !== port.id,
    };
  }

  private getStatusText(): string {
    return this.node.status?.toLowerCase().replace('_', ' ') || 'idle';
  }

  private renderPort(port: NodePort, isInput: boolean, index: number, total: number) {
    // Position ports vertically centered in the node
    // Node height is approximately 80px (header 40px + body ~40px)
    const nodeHeight = 80;
    const portSize = 10;
    const portSpacing = 20; // Space between multiple ports

    // Calculate vertical center position
    const totalPortsHeight = (total - 1) * portSpacing;
    const startY = (nodeHeight - totalPortsHeight) / 2;
    const topOffset = startY + (index * portSpacing) - (portSize / 2);

    const style = {
      top: `${topOffset}px`,
    };

    return html`
      <div
        class=${classMap(this.getPortClasses(port, isInput))}
        style=${styleMap(style)}
        @mousedown=${(e: MouseEvent) => this.handlePortMouseDown(e, port, isInput)}
        @mouseup=${(e: MouseEvent) => this.handlePortMouseUp(e, port, isInput)}
        @mouseenter=${() => this.handlePortMouseEnter(port.id)}
        @mouseleave=${() => this.handlePortMouseLeave()}
        data-port-id=${port.id}
        data-node-id=${this.node.id}
        title=${port.label || port.id}
      >
        ${this.hoveredPort === port.id && port.label ? html`
          <span class="port-label ${isInput ? 'input' : 'output'}">${port.label}</span>
        ` : nothing}
      </div>
    `;
  }

  private renderConfigPort(port: NodePort, index: number, total: number) {
    // Position config ports evenly spaced along the bottom using percentages
    const portSpacing = 45; // Space between ports in px (wider for labels)
    // Center the group of ports, offset each by index
    const leftPercent = 50; // Center point
    const offsetFromCenter = (index - (total - 1) / 2) * portSpacing;

    const style = {
      left: `calc(${leftPercent}% + ${offsetFromCenter}px - 5px)`,
    };

    const classes = {
      port: true,
      config: true,
      connecting: this.connectingPortId === port.id,
      compatible: this.connectingPortId !== null && this.connectingPortId !== port.id,
    };

    return html`
      <div
        class=${classMap(classes)}
        style=${styleMap(style)}
        @mousedown=${(e: MouseEvent) => this.handlePortMouseDown(e, port, true)}
        @mouseup=${(e: MouseEvent) => this.handlePortMouseUp(e, port, true)}
        @mouseenter=${() => this.handlePortMouseEnter(port.id)}
        @mouseleave=${() => this.handlePortMouseLeave()}
        data-port-id=${port.id}
        data-node-id=${this.node.id}
        title=${port.label || port.id}
      >
        ${port.label ? html`
          <span class="port-label config">${port.label}</span>
        ` : nothing}
      </div>
    `;
  }

  private renderRemoteOverlays() {
    return html`
      ${this.remoteSelection ? html`
        <div
          class="remote-selection-ring"
          style="border-color: ${this.remoteSelection.color};"
        ></div>
      ` : nothing}
      ${this.remoteTyping ? html`
        <div
          class="remote-typing-indicator"
          style="color: ${this.remoteTyping.color};"
        >
          ${this.remoteTyping.username} is typing...
        </div>
      ` : nothing}
    `;
  }

  private wrapWithRemoteOverlays(content: ReturnType<typeof html>) {
    if (this.remoteSelection || this.remoteTyping) {
      return html`
        <div class="remote-overlay-wrapper" style="position: relative;">
          ${content}
          ${this.renderRemoteOverlays()}
        </div>
      `;
    }
    return content;
  }

  override render() {
    // Use special rendering for DB Table nodes
    if (this.isDbTableNode()) {
      return this.wrapWithRemoteOverlays(this.renderDbTableNode());
    }

    // Use special rendering for UI Table nodes
    if (this.isUiTableNode()) {
      return this.wrapWithRemoteOverlays(this.renderUiTableNode());
    }

    // Use special rendering for Note nodes
    if (this.isNoteNode()) {
      return this.wrapWithRemoteOverlays(this.renderNoteNode());
    }

    const nodeColor = this.getNodeColor();
    const nodeIcon = this.getNodeIcon();
    const isAgent = isAgentNode(this.node.type);
    const hasPreview = this.hasPreviewPanel();
    const isStart = this.isStartNode();
    const status = this.node.status || ExecutionStatus.IDLE;

    const containerClasses = {
      'node-container': true,
      selected: this.selected,
      dragging: this.dragging,
      'remote-selected': !!this.remoteSelection,
      [`status-${status.toLowerCase()}`]: true,
    };

    const containerStyles = {
      '--node-accent': nodeColor,
      left: `${this.node.position.x}px`,
      top: `${this.node.position.y}px`,
    };

    const nodeContent = html`
      <div
        class=${classMap(containerClasses)}
        style=${styleMap(containerStyles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="node-header">
          <div class="node-icon" style="background: ${nodeColor}">
            <nr-icon name=${nodeIcon} size="small"></nr-icon>
          </div>
          <span class="node-title">${this.node.name}</span>
          ${isAgent ? html`
            <span class="node-type-badge agent">AI</span>
          ` : nothing}
        </div>

        <div class="node-body">
          ${this.node.metadata?.description ? html`
            <div class="node-description">${this.node.metadata.description}</div>
          ` : nothing}
          ${isStart ? html`
            <nr-button
              size="small"
              variant="ghost"
              @click=${this.handleTriggerClick}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              title="Trigger workflow"
            >
              <nr-icon slot="prefix" name="play" size="small"></nr-icon>
              Trigger
            </nr-button>
          ` : nothing}
          ${hasPreview ? html`
            <nr-button
              size="small"
              variant="ghost"
              @click=${this.handlePreviewClick}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              title="Test workflow"
            >
              <nr-icon slot="prefix" name="eye" size="small"></nr-icon>
              Test
            </nr-button>
          ` : nothing}
        </div>

        ${this.node.agentActivity?.active ? html`
          <div class="node-status">
            <span class="status-dot ${this.node.agentActivity.type === 'llm' ? 'thinking' : 'tool'}"></span>
            <span class="status-text">${this.node.agentActivity.type === 'llm' ? 'Thinking' : this.node.agentActivity.name || 'Tool'}</span>
          </div>
        ` : status !== ExecutionStatus.IDLE ? html`
          <div class="node-status">
            <span class="status-dot ${status.toLowerCase()}"></span>
            <span class="status-text">${this.getStatusText()}</span>
          </div>
        ` : nothing}

        ${this.renderTriggerStatus()}

        ${this.node.error ? html`
          <div class="node-error">${this.node.error}</div>
        ` : nothing}

        <div class="ports-container">
          ${this.node.ports.inputs.map((port, i) =>
            this.renderPort(port, true, i, this.node.ports.inputs.length)
          )}
          ${this.node.ports.outputs.map((port, i) =>
            this.renderPort(port, false, i, this.node.ports.outputs.length)
          )}
          ${this.node.ports.configs?.map((port, i) =>
            this.renderConfigPort(port, i, this.node.ports.configs!.length)
          )}
        </div>
      </div>
    `;

    return this.wrapWithRemoteOverlays(nodeContent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflow-node': WorkflowNodeElement;
  }
}
