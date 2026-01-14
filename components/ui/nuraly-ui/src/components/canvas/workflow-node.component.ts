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
  NODE_COLORS,
  NODE_ICONS,
  isAgentNode,
  WorkflowNodeType,
  DbDesignerNodeType,
} from './workflow-canvas.types.js';
import { styles } from './workflow-node.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import '../icon/icon.component.js';

/**
 * Workflow node component for displaying individual nodes in the canvas
 *
 * @element workflow-node
 * @fires node-mousedown - When node is clicked for dragging
 * @fires port-mousedown - When a port is clicked to start connection
 * @fires port-mouseup - When mouse is released on a port
 * @fires node-dblclick - When node is double-clicked for editing
 * @fires node-preview - When preview button is clicked (for chatbot nodes)
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

  @state()
  private hoveredPort: string | null = null;

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
    return this.node.type === WorkflowNodeType.CHATBOT;
  }

  private isDbTableNode(): boolean {
    return this.node.type === DbDesignerNodeType.TABLE;
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

  override render() {
    // Use special rendering for DB Table nodes
    if (this.isDbTableNode()) {
      return this.renderDbTableNode();
    }

    const nodeColor = this.getNodeColor();
    const nodeIcon = this.getNodeIcon();
    const isAgent = isAgentNode(this.node.type);
    const isChatbot = this.isChatbotNode();
    const status = this.node.status || ExecutionStatus.IDLE;

    const containerClasses = {
      'node-container': true,
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
          ${isChatbot ? html`
            <button
              class="node-preview-btn"
              @click=${this.handlePreviewClick}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              title="Open chat preview"
            >
              <nr-icon name="eye" size="small"></nr-icon>
              <span>Preview</span>
            </button>
          ` : nothing}
        </div>

        ${status !== ExecutionStatus.IDLE ? html`
          <div class="node-status">
            <span class="status-dot ${status.toLowerCase()}"></span>
            <span class="status-text">${this.getStatusText()}</span>
          </div>
        ` : nothing}

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
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflow-node': WorkflowNodeElement;
  }
}
