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
    const headerHeight = 40;
    const bodyHeight = 40;
    const portSpacing = (bodyHeight) / (total + 1);
    const topOffset = headerHeight + portSpacing * (index + 1);

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
    const nodeColor = this.getNodeColor();
    const nodeIcon = this.getNodeIcon();
    const isAgent = isAgentNode(this.node.type);
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
