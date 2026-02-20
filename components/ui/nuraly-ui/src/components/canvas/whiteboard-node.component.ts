/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, svg, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import mermaid from 'mermaid';
import {
  WorkflowNode,
  NODE_COLORS,
  WhiteboardNodeType,
} from './workflow-canvas.types.js';
import { styles } from './whiteboard-node.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import '../icon/icon.component.js';

/**
 * Whiteboard node component for displaying Miro-style visual elements
 *
 * @element whiteboard-node
 * @fires node-mousedown - When node is clicked for dragging
 * @fires port-mousedown - When a port is clicked to start connection
 * @fires port-mouseup - When mouse is released on a port
 * @fires node-dblclick - When node is double-clicked for editing
 * @fires node-click - When node is clicked (for onClick actions like pan-to-anchor)
 * @fires note-content-change - When text content changes
 * @fires note-edit-end - When editing ends
 * @fires note-resize-start - When resize handle is grabbed
 */
@customElement('whiteboard-node')
export class WhiteboardNodeElement extends NuralyUIBaseMixin(LitElement) {
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

  @property({ type: String })
  actionTargetLabel = '';

  @state()
  private _mermaidSvg = '';

  @state()
  private _mermaidError = '';

  private _lastMermaidDef = '';
  private _lastMermaidTheme = '';

  /** Track mousedown position to distinguish clicks from drags */
  private _mouseDownPos: { x: number; y: number } | null = null;
  private static readonly CLICK_THRESHOLD = 5;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mousedown', this._trackMouseDown);
    this.addEventListener('click', this._handleHostClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mousedown', this._trackMouseDown);
    this.removeEventListener('click', this._handleHostClick);
  }

  private _trackMouseDown = (e: MouseEvent) => {
    this._mouseDownPos = { x: e.clientX, y: e.clientY };
  };

  private _handleHostClick = (e: MouseEvent) => {
    // Suppress click if mouse moved beyond threshold (i.e. a drag happened)
    if (this._mouseDownPos) {
      const dx = e.clientX - this._mouseDownPos.x;
      const dy = e.clientY - this._mouseDownPos.y;
      if (Math.abs(dx) > WhiteboardNodeElement.CLICK_THRESHOLD ||
          Math.abs(dy) > WhiteboardNodeElement.CLICK_THRESHOLD) {
        this._mouseDownPos = null;
        return;
      }
    }
    this._mouseDownPos = null;
    e.stopPropagation();
    this.dispatchEvent(new CustomEvent('node-click', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  };

  private _handleActionBadgeMouseDown(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  private _handleActionBadgeClick(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.dispatchEvent(new CustomEvent('node-action-trigger', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  private _handleActionBadgeTouchEnd(e: TouchEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('node-action-trigger', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    // Focus textarea when entering edit mode
    if (changedProperties.has('editing') && this.editing) {
      const textarea = this.shadowRoot?.querySelector('.wb-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }

    // Re-render mermaid diagram when node config changes
    if (changedProperties.has('node') && this.node?.type === WhiteboardNodeType.MERMAID) {
      const def = (this.node.configuration?.textContent as string) || '';
      const theme = (this.node.configuration?.mermaidTheme as string) || 'default';
      if (def && (def !== this._lastMermaidDef || theme !== this._lastMermaidTheme)) {
        this._lastMermaidDef = def;
        this._lastMermaidTheme = theme;
        this._renderMermaid(def, theme);
      }
    }
  }

  private async _renderMermaid(definition: string, theme: string = 'default') {
    mermaid.initialize({ startOnLoad: false, theme: theme as any });
    try {
      const { svg } = await mermaid.render(`mermaid-${this.node.id.replace(/[^a-zA-Z0-9]/g, '')}`, definition);
      this._mermaidSvg = svg;
      this._mermaidError = '';
    } catch (err: unknown) {
      this._mermaidError = err instanceof Error ? err.message : 'Invalid Mermaid syntax';
      this._mermaidSvg = '';
    }
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

  private handleWbTextBlur(e: FocusEvent) {
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

  private handleWbTextKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('note-edit-end', {
        detail: { node: this.node },
        bubbles: true,
        composed: true,
      }));
    }
  }

  private handleWbResizeStart(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('note-resize-start', {
      detail: { node: this.node, event: e },
      bubbles: true,
      composed: true,
    }));
  }

  // ==================== Render Methods ====================

  private renderWbStickyNote(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const textContent = (config.textContent as string) || 'Add note...';
    const bgColor = (config.backgroundColor as string) || '#fef08a';
    const textColor = (config.textColor as string) || '#713f12';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-sticky-note': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-sticky-body" style="background: ${bgColor}; color: ${textColor};">
          ${this.editing ? html`
            <textarea
              class="wb-textarea"
              .value=${textContent}
              @blur=${this.handleWbTextBlur}
              @keydown=${this.handleWbTextKeydown}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              @dblclick=${(e: MouseEvent) => e.stopPropagation()}
              style="color: ${textColor};"
            ></textarea>
          ` : html`
            <span class="wb-text">${textContent}</span>
          `}
        </div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderWbTextBlock(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const textContent = (config.textContent as string) || 'Type text...';
    const textColor = (config.textColor as string) || '#1a1a1a';
    const fontSize = (config.fontSize as number) || 16;

    return html`
      <div
        class=${classMap({ ...classes, 'wb-text-block': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-text-body" style="color: ${textColor}; font-size: ${fontSize}px;">
          ${this.editing ? html`
            <textarea
              class="wb-textarea"
              .value=${textContent}
              @blur=${this.handleWbTextBlur}
              @keydown=${this.handleWbTextKeydown}
              @mousedown=${(e: MouseEvent) => e.stopPropagation()}
              @dblclick=${(e: MouseEvent) => e.stopPropagation()}
              style="color: ${textColor}; font-size: ${fontSize}px;"
            ></textarea>
          ` : html`
            <span class="wb-text">${textContent}</span>
          `}
        </div>
      </div>
    `;
  }

  private renderWbRectangle(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const textContent = (config.textContent as string) || '';
    const bgColor = (config.backgroundColor as string) || (config.fillColor as string) || '#3b82f6';
    const textColor = (config.textColor as string) || '#ffffff';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-shape': true, 'wb-shape-rectangle': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-shape-body" style="background: ${bgColor}; color: ${textColor};">
          ${textContent ? html`<span class="wb-shape-text">${textContent}</span>` : nothing}
        </div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderWbShape(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>, shape: string) {
    const textContent = (config.textContent as string) || '';
    const bgColor = (config.backgroundColor as string) || (config.fillColor as string) || NODE_COLORS[this.node.type] || '#8b5cf6';
    const textColor = (config.textColor as string) || '#ffffff';
    const width = (config.width as number) || 120;
    const height = (config.height as number) || 120;
    const stroke = (config.borderColor as string) || 'none';
    const strokeWidth = (config.borderWidth as number) || 0;

    return html`
      <div
        class=${classMap({ ...classes, 'wb-shape': true, [`wb-shape-${shape}`]: true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <svg class="wb-shape-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
          ${this.renderSvgShape(shape, width, height, bgColor, stroke, strokeWidth)}
        </svg>
        ${textContent ? html`<span class="wb-shape-text" style="color: ${textColor};">${textContent}</span>` : nothing}
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderSvgShape(shape: string, w: number, h: number, fill: string, stroke: string, strokeWidth: number) {
    switch (shape) {
      case 'circle':
        return svg`<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2 - 2}" ry="${h / 2 - 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

      case 'diamond':
        return svg`<polygon points="${w / 2},2 ${w - 2},${h / 2} ${w / 2},${h - 2} 2,${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

      case 'triangle':
        return svg`<polygon points="${w / 2},2 ${w - 2},${h - 2} 2,${h - 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

      case 'star': {
        const cx = w / 2, cy = h / 2;
        const outerR = Math.min(w, h) / 2 - 2;
        const innerR = outerR * 0.4;
        const points: string[] = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (Math.PI / 2) + (Math.PI * 2 * i / 10);
          points.push(`${cx + r * Math.cos(angle)},${cy - r * Math.sin(angle)}`);
        }
        return svg`<polygon points="${points.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
      }

      case 'hexagon': {
        const cx = w / 2, cy = h / 2;
        const r = Math.min(w, h) / 2 - 2;
        const points: string[] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 6) + (Math.PI * 2 * i / 6);
          points.push(`${cx + r * Math.cos(angle)},${cy - r * Math.sin(angle)}`);
        }
        return svg`<polygon points="${points.join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
      }

      default:
        return svg`<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
    }
  }

  private renderWbLine(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>, hasArrow: boolean) {
    const width = (config.width as number) || 200;
    const height = (config.height as number) || 4;
    const bgColor = (config.backgroundColor as string) || (config.fillColor as string) || '#6b7280';
    const svgH = Math.max(height, 20);
    const midY = svgH / 2;

    return html`
      <div
        class=${classMap({ ...classes, 'wb-shape': true, 'wb-shape-line': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <svg class="wb-shape-svg" viewBox="0 0 ${width} ${svgH}" width="${width}" height="${svgH}">
          ${svg`<line x1="0" y1="${midY}" x2="${width}" y2="${midY}" stroke="${bgColor}" stroke-width="3" />`}
          ${hasArrow ? svg`<polygon points="${width - 12},${midY - 6} ${width},${midY} ${width - 12},${midY + 6}" fill="${bgColor}" />` : nothing}
        </svg>
      </div>
    `;
  }

  private renderWbImage(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const imageUrl = (config.imageUrl as string) || '';
    const imageAlt = (config.imageAlt as string) || 'Image';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-image': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-image-body">
          ${imageUrl ? html`
            <img class="wb-image-content" src=${imageUrl} alt=${imageAlt} />
          ` : html`
            <div class="wb-image-placeholder">
              <nr-icon name="image" size="large"></nr-icon>
              <span>Double-click to add image</span>
            </div>
          `}
        </div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderWbFrame(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const label = (config.textContent as string) || this.node.name || 'Frame';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-frame': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-frame-label">${label}</div>
        <div class="wb-frame-body"></div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderWbVoting(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const textContent = (config.textContent as string) || 'Vote topic';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-voting': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-voting-body">
          <nr-icon name="thumbs-up" size="medium"></nr-icon>
          <span class="wb-voting-text">${textContent}</span>
        </div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderWbMermaid(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const definition = (config.textContent as string) || '';
    const bgColor = (config.backgroundColor as string) || '#ffffff';
    const borderColor = (config.borderColor as string) || '#8b5cf6';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-mermaid': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        ${this.node.name ? html`<div class="wb-mermaid-label">${this.node.name}</div>` : nothing}
        <div class="wb-mermaid-body" style="background: ${bgColor}; border-color: ${borderColor};">
          ${this._mermaidSvg ? html`
            <div class="wb-mermaid-content">${unsafeHTML(this._mermaidSvg)}</div>
          ` : this._mermaidError ? html`
            <div class="wb-mermaid-placeholder">
              <nr-icon name="alert-triangle" size="large"></nr-icon>
              <span>${this._mermaidError}</span>
            </div>
          ` : !definition ? html`
            <div class="wb-mermaid-placeholder">
              <nr-icon name="git-branch" size="large"></nr-icon>
              <span>Double-click to add Mermaid diagram</span>
            </div>
          ` : html`
            <div class="wb-mermaid-placeholder">
              <nr-icon name="loader" size="large"></nr-icon>
              <span>Rendering...</span>
            </div>
          `}
        </div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private renderWbAnchor(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const label = (config.anchorLabel as string) || 'Anchor';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-anchor': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <nr-icon name="anchor" size="small"></nr-icon>
        ${this.editing ? html`
          <input
            type="text"
            class="wb-anchor-input"
            .value=${label}
            @blur=${(e: FocusEvent) => {
              const input = e.target as HTMLInputElement;
              this.dispatchEvent(new CustomEvent('note-content-change', {
                detail: { node: this.node, content: input.value },
                bubbles: true,
                composed: true,
              }));
              this.dispatchEvent(new CustomEvent('note-edit-end', {
                detail: { node: this.node },
                bubbles: true,
                composed: true,
              }));
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            @mousedown=${(e: MouseEvent) => e.stopPropagation()}
            @dblclick=${(e: MouseEvent) => e.stopPropagation()}
          />
        ` : html`
          <span class="wb-anchor-label">${label}</span>
        `}
      </div>
    `;
  }

  private renderWbWorkflow(classes: Record<string, boolean>, styles: Record<string, string>, config: Record<string, unknown>) {
    const workflowName = (config.workflowName as string) || 'Workflow';
    const steps = (config.workflowSteps as Array<{ name: string; type: string }>) || [];
    const headerColor = NODE_COLORS[WhiteboardNodeType.WORKFLOW] || '#6366f1';

    return html`
      <div
        class=${classMap({ ...classes, 'wb-workflow': true })}
        style=${styleMap(styles)}
        data-theme=${this.currentTheme}
        @mousedown=${this.handleNodeMouseDown}
        @dblclick=${this.handleNodeDblClick}
      >
        <div class="wb-workflow-header" style="background: ${headerColor};">
          <nr-icon name="layers" size="small"></nr-icon>
          <span class="wb-workflow-header-name">${workflowName}</span>
        </div>
        <div class="wb-workflow-body">
          ${steps.length > 0 ? html`
            <div class="wb-workflow-steps">
              ${steps.map(step => html`
                <div class="wb-workflow-step">
                  <nr-icon name=${this._getStepIcon(step.type)} size="small"></nr-icon>
                  <span class="wb-workflow-step-name">${step.name}</span>
                </div>
              `)}
            </div>
          ` : html`
            <div class="wb-workflow-empty">
              <nr-icon name="layers" size="large"></nr-icon>
              <span>Double-click to configure</span>
            </div>
          `}
        </div>
        ${this.selected ? html`<div class="wb-resize-handle" @mousedown=${this.handleWbResizeStart}></div>` : nothing}
      </div>
    `;
  }

  private _getStepIcon(type: string): string {
    const iconMap: Record<string, string> = {
      START: 'play',
      END: 'stop',
      HTTP: 'globe',
      FUNCTION: 'code',
      CONDITION: 'git-branch',
      LOOP: 'repeat',
      DELAY: 'clock',
      TRANSFORM: 'shuffle',
      LLM: 'brain',
      SUB_WORKFLOW: 'layers',
      DATABASE: 'database',
      EMAIL: 'mail',
      NOTIFICATION: 'bell',
    };
    return iconMap[type] || 'circle';
  }

  private renderActionIndicator() {
    const action = this.node.configuration?.onClickAction;
    if (!action || action === 'none') return nothing;

    const config = this.node.configuration || {};
    const width = (config.width as number) || 200;
    const height = (config.height as number) || 200;

    // Use a proxy container that matches the node's position and size so the
    // badge can use simple bottom/left:50% positioning relative to it.
    return html`
      <div
        class="wb-action-badge-anchor"
        style="position:absolute; left:${this.node.position.x}px; top:${this.node.position.y}px; width:${width}px; height:${height}px; pointer-events:none;"
      >
        <div
          class="wb-action-indicator"
          @mousedown=${this._handleActionBadgeMouseDown}
          @click=${this._handleActionBadgeClick}
          @touchend=${this._handleActionBadgeTouchEnd}
        >
          <nr-icon name="navigation" size="small"></nr-icon>
          <span class="wb-action-indicator-label">${this.actionTargetLabel || 'Anchor'}</span>
        </div>
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

  override render() {
    const config = this.node.configuration || {};
    const nodeType = this.node.type as WhiteboardNodeType;
    const width = (config.width as number) || 200;
    const height = (config.height as number) || 200;
    const bgColor = (config.backgroundColor as string) || (config.fillColor as string) || NODE_COLORS[this.node.type] || '#3b82f6';
    const textColor = (config.textColor as string) || '#1a1a1a';
    const fontSize = (config.fontSize as number) || 14;
    const textAlign = (config.textAlign as string) || 'center';
    const borderColor = (config.borderColor as string) || 'transparent';
    const borderWidth = (config.borderWidth as number) || 0;
    const borderRadius = (config.borderRadius as number) || 0;
    const opacity = (config.opacity as number) ?? 1;
    const rotation = (config.rotation as number) || 0;

    const containerClasses = {
      'node-container': true,
      'wb-node': true,
      selected: this.selected,
      dragging: this.dragging,
      editing: this.editing,
      'remote-selected': !!this.remoteSelection,
    };

    const containerStyles: Record<string, string> = {
      left: `${this.node.position.x}px`,
      top: `${this.node.position.y}px`,
      '--wb-width': `${width}px`,
      '--wb-height': `${height}px`,
      '--wb-bg': bgColor,
      '--wb-text-color': textColor,
      '--wb-font-size': `${fontSize}px`,
      '--wb-text-align': textAlign,
      '--wb-border-color': borderColor,
      '--wb-border-width': `${borderWidth}px`,
      '--wb-border-radius': `${borderRadius}px`,
      '--wb-opacity': `${opacity}`,
      '--wb-rotation': `${rotation}deg`,
    };

    if (this.remoteSelection) {
      containerStyles['--remote-selection-color'] = this.remoteSelection.color;
    }

    let nodeContent;
    switch (nodeType) {
      case WhiteboardNodeType.STICKY_NOTE:
        nodeContent = this.renderWbStickyNote(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.TEXT_BLOCK:
        nodeContent = this.renderWbTextBlock(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.SHAPE_CIRCLE:
        nodeContent = this.renderWbShape(containerClasses, containerStyles, config, 'circle');
        break;

      case WhiteboardNodeType.SHAPE_DIAMOND:
        nodeContent = this.renderWbShape(containerClasses, containerStyles, config, 'diamond');
        break;

      case WhiteboardNodeType.SHAPE_TRIANGLE:
        nodeContent = this.renderWbShape(containerClasses, containerStyles, config, 'triangle');
        break;

      case WhiteboardNodeType.SHAPE_STAR:
        nodeContent = this.renderWbShape(containerClasses, containerStyles, config, 'star');
        break;

      case WhiteboardNodeType.SHAPE_HEXAGON:
        nodeContent = this.renderWbShape(containerClasses, containerStyles, config, 'hexagon');
        break;

      case WhiteboardNodeType.SHAPE_ARROW:
      case WhiteboardNodeType.SHAPE_LINE:
        nodeContent = this.renderWbLine(containerClasses, containerStyles, config, nodeType === WhiteboardNodeType.SHAPE_ARROW);
        break;

      case WhiteboardNodeType.IMAGE:
        nodeContent = this.renderWbImage(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.FRAME:
        nodeContent = this.renderWbFrame(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.VOTING:
        nodeContent = this.renderWbVoting(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.MERMAID:
        nodeContent = this.renderWbMermaid(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.ANCHOR:
        nodeContent = this.renderWbAnchor(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.WORKFLOW:
        nodeContent = this.renderWbWorkflow(containerClasses, containerStyles, config);
        break;

      case WhiteboardNodeType.SHAPE_RECTANGLE:
      default:
        nodeContent = this.renderWbRectangle(containerClasses, containerStyles, config);
        break;
    }

    // Action badge is rendered as a standalone absolute-positioned element
    // (not inside the wrapper) because the node container uses position: relative
    // with left/top offsets, making wrapper-relative positioning incorrect.
    const hasAction = this.node.configuration?.onClickAction &&
                      this.node.configuration.onClickAction !== 'none';

    // If we have remote overlays, wrap in a container
    if (this.remoteSelection || this.remoteTyping) {
      return html`
        <div class="remote-overlay-wrapper" style="position: relative;">
          ${nodeContent}
          ${this.renderRemoteOverlays()}
        </div>
        ${hasAction ? this.renderActionIndicator() : nothing}
      `;
    }

    if (hasAction) {
      return html`${nodeContent}${this.renderActionIndicator()}`;
    }

    return nodeContent;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'whiteboard-node': WhiteboardNodeElement;
  }
}
