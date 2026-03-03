/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotArtifact } from '../chatbot.types.js';
import { ChatPluginBase } from './chat-plugin.js';
import { escapeHtml } from '../utils/index.js';

// ── Types ──────────────────────────────────────────────────────────

interface WorkflowEvent {
  Name: string;
  Type: string;
}

interface WorkflowStep {
  Description?: string;
  StepType?: string;
  WorkerStepType?: string;
  SystemTaskType?: string;
  Type?: string;
  Configuration?: Record<string, unknown>;
}

interface WorkflowTransition {
  Source: string;
  Target: string;
}

interface WorkflowDefinition {
  Name?: string;
  DocflowTags?: string[];
  Events?: { StartEvent?: WorkflowEvent; EndEvent?: WorkflowEvent };
  Steps: Record<string, WorkflowStep>;
  Transitions: Record<string, WorkflowTransition>;
  [key: string]: unknown;
}

// ── localStorage keys ───────────────────────────────────────────────

const LS_SPLIT_WIDTH  = 'nuraly:flow-diagram:split-width';
const LS_PANEL_WIDTH  = 'nuraly:flow-diagram:panel-width';
const DEFAULT_PANEL_WIDTH = 500;

// ── Custom Element ─────────────────────────────────────────────────

const ELEMENT_TAG = 'nr-flow-diagram-editor';

class FlowDiagramEditorElement extends HTMLElement {
  private _panelObserver?: ResizeObserver;

  connectedCallback() {
    // Restore (or set default) artifact panel width from localStorage
    const panelWidth = this.loadPanelWidth();
    const panel = this.closestPanel();
    if (panel) {
      panel.style.setProperty('width', `${panelWidth}px`);
      // Observe panel width changes and persist them
      this._panelObserver = new ResizeObserver(() => {
        const w = Math.round(panel.getBoundingClientRect().width);
        if (w >= 200) localStorage.setItem(LS_PANEL_WIDTH, String(w));
      });
      this._panelObserver.observe(panel);
    }

    const shadow = this.attachShadow({ mode: 'open' });
    const raw = this.getAttribute('content') ?? '';
    const json = this.unescapeHtml(raw);
    const pretty = this.prettyPrint(json);

    let workflow: WorkflowDefinition | null = null;
    try {
      workflow = JSON.parse(json);
    } catch {
      // will show error state
    }

    shadow.innerHTML = `
      <style>${FlowDiagramEditorElement.styles()}</style>
      ${this.renderHeader(workflow)}
      <div class="split">
        <div class="editor-pane">
          <textarea class="editor-textarea" spellcheck="false"></textarea>
        </div>
        <div class="resize-handle"><div class="resize-handle-bar"></div></div>
        <div class="diagram-pane">
          ${workflow ? this.renderDiagram(workflow) : '<div class="empty">Invalid JSON</div>'}
        </div>
      </div>
      <div class="error-bar" style="display:none;"></div>
    `;

    const textarea = shadow.querySelector('.editor-textarea') as HTMLTextAreaElement;
    textarea.value = pretty;

    // Restore saved editor pane split width
    const savedSplitWidth = localStorage.getItem(LS_SPLIT_WIDTH);
    if (savedSplitWidth) {
      requestAnimationFrame(() => {
        const editorPane = shadow.querySelector('.editor-pane') as HTMLElement;
        if (editorPane) {
          editorPane.style.flex = 'none';
          editorPane.style.width = `${savedSplitWidth}px`;
        }
      });
    }

    const diagramPane = shadow.querySelector('.diagram-pane')!;
    const errorBar    = shadow.querySelector('.error-bar') as HTMLElement;

    textarea.addEventListener('input', () => {
      try {
        const parsed = JSON.parse(textarea.value) as WorkflowDefinition;
        if (parsed.Steps && parsed.Transitions) {
          diagramPane.innerHTML = this.renderDiagram(parsed);
          const header = shadow.querySelector('.header');
          if (header) {
            const tpl = document.createElement('template');
            tpl.innerHTML = this.renderHeader(parsed).trim();
            header.replaceWith(tpl.content.firstElementChild!);
          }
        }
        errorBar.style.display = 'none';
      } catch (err) {
        errorBar.textContent = `Parse error: ${(err as Error).message}`;
        errorBar.style.display = 'flex';
      }
    });

    // ── Resizable split panes ──────────────────────────────────────
    this.initResize(shadow);
  }

  disconnectedCallback() {
    this._panelObserver?.disconnect();
    this.closestPanel()?.style.removeProperty('width');
  }

  // ── localStorage helpers ──────────────────────────────────────────

  private loadPanelWidth(): number {
    const saved = localStorage.getItem(LS_PANEL_WIDTH);
    return saved ? Math.max(300, parseInt(saved, 10)) : DEFAULT_PANEL_WIDTH;
  }

  // ── DOM helpers ───────────────────────────────────────────────────

  /** Walk up the DOM (crossing shadow boundaries) to find .artifact-panel */
  private closestPanel(): HTMLElement | null {
    let node: Node | null = this;
    while (node) {
      if (node instanceof HTMLElement && node.classList.contains('artifact-panel')) {
        return node;
      }
      node = node.parentElement ?? (node.getRootNode() as ShadowRoot).host ?? null;
    }
    return null;
  }

  // ── Resizable split ───────────────────────────────────────────────

  private initResize(shadow: ShadowRoot): void {
    const split      = shadow.querySelector('.split') as HTMLElement;
    const editorPane = shadow.querySelector('.editor-pane') as HTMLElement;
    const handle     = shadow.querySelector('.resize-handle') as HTMLElement;
    if (!split || !editorPane || !handle) return;

    let dragging = false;
    let startX = 0;
    let startWidth = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const splitWidth = split.getBoundingClientRect().width;
      const newWidth = Math.max(200, Math.min(startWidth + dx, splitWidth - 200));
      editorPane.style.flex = 'none';
      editorPane.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // Persist the editor pane width
      const w = Math.round(editorPane.getBoundingClientRect().width);
      if (w >= 200) localStorage.setItem(LS_SPLIT_WIDTH, String(w));
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', (e: Event) => {
      const me = e as MouseEvent;
      me.preventDefault();
      dragging = true;
      startX = me.clientX;
      startWidth = editorPane.getBoundingClientRect().width;
      handle.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────

  private prettyPrint(json: string): string {
    try { return JSON.stringify(JSON.parse(json), null, 2); }
    catch { return json; }
  }

  private unescapeHtml(str: string): string {
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  // ── Header ────────────────────────────────────────────────────────

  private renderHeader(wf: WorkflowDefinition | null): string {
    const name = wf?.Name ?? 'Workflow';
    const tags = wf?.DocflowTags ?? [];
    const tagBadges = tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
    return `
      <div class="header">
        <span class="header-icon">&#x2B21;</span>
        <span class="header-name">${escapeHtml(name)}</span>
        ${tagBadges}
      </div>
    `;
  }

  // ── Diagram rendering ─────────────────────────────────────────────

  private renderDiagram(wf: WorkflowDefinition): string {
    const ordered = this.buildOrderedSteps(wf);
    const nodes: string[] = [];
    for (let i = 0; i < ordered.length; i++) {
      const item = ordered[i];
      nodes.push(
        item.type === 'event'
          ? this.renderEventNode(item.name, item.eventType!)
          : this.renderStepNode(item.name, item.step!)
      );
      if (i < ordered.length - 1) nodes.push(this.renderConnector());
    }
    return `<div class="diagram">${nodes.join('')}</div>`;
  }

  private buildOrderedSteps(wf: WorkflowDefinition): Array<{
    type: 'event' | 'step';
    name: string;
    eventType?: string;
    step?: WorkflowStep;
  }> {
    const result: Array<{ type: 'event' | 'step'; name: string; eventType?: string; step?: WorkflowStep }> = [];

    const hasStart = wf.Events?.StartEvent;
    const hasEnd   = wf.Events?.EndEvent;

    if (hasStart) result.push({ type: 'event', name: hasStart.Name || 'Start', eventType: 'start' });

    const sourceToTransition: Record<string, WorkflowTransition> = {};
    for (const t of Object.values(wf.Transitions)) sourceToTransition[t.Source] = t;

    let current: string | undefined = sourceToTransition['StartEvent']?.Target ?? Object.keys(wf.Steps)[0];

    const visited = new Set<string>();
    while (current && wf.Steps[current] && !visited.has(current)) {
      visited.add(current);
      result.push({ type: 'step', name: current, step: wf.Steps[current] });
      const next: WorkflowTransition | undefined = sourceToTransition[current];
      if (!next || next.Target === 'EndEvent') break;
      current = next.Target;
    }

    if (hasEnd) result.push({ type: 'event', name: hasEnd.Name || 'End', eventType: 'end' });
    return result;
  }

  private renderEventNode(name: string, type: string): string {
    const isStart = type === 'start';
    return `
      <div class="node event-node ${isStart ? 'event-start' : 'event-end'}">
        <span class="event-icon">${isStart ? '&#9679;' : '&#9632;'}</span>
        <span class="event-label">${escapeHtml(name)}</span>
      </div>
    `;
  }

  private renderStepNode(name: string, step: WorkflowStep): string {
    const stepType  = step.StepType ?? '';
    const desc      = step.Description?.trim() ?? '';
    const badgeCls  = stepType === 'Worker' ? 'badge-worker' : 'badge-system';
    const badge     = stepType ? `<span class="step-badge ${badgeCls}">${escapeHtml(stepType)}</span>` : '';
    const descHtml  = desc ? `<div class="step-desc">${escapeHtml(desc)}</div>` : '';
    return `
      <div class="node step-node">
        <div class="step-header">
          <span class="step-name">${escapeHtml(name)}</span>
          ${badge}
        </div>
        ${descHtml}
      </div>
    `;
  }

  private renderConnector(): string {
    return `
      <div class="connector">
        <div class="connector-line"></div>
        <div class="connector-arrow">&#9660;</div>
      </div>
    `;
  }

  // ── Styles ────────────────────────────────────────────────────────

  static styles(): string {
    return `
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 480px;
        height: 100%;
        font-family: system-ui, -apple-system, sans-serif;
        color: #1e293b;
        overflow: hidden;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        background: #f8fafc;
        flex-shrink: 0;
      }
      .header-icon { font-size: 18px; color: #6366f1; }
      .header-name { font-weight: 600; font-size: 15px; }
      .tag {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 10px;
        background: #ede9fe;
        color: #6366f1;
        font-weight: 500;
      }

      .split {
        display: flex;
        flex: 1;
        min-height: 0;
      }

      .editor-pane {
        flex: 1;
        min-width: 200px;
        display: flex;
        overflow: hidden;
      }
      .editor-textarea {
        flex: 1;
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        resize: none;
        padding: 12px;
        font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
        font-size: 12px;
        line-height: 1.6;
        color: #1e293b;
        background: #ffffff;
        box-sizing: border-box;
        tab-size: 2;
      }

      /* ── Resize handle ──────────────────────────────── */

      .resize-handle {
        flex-shrink: 0;
        width: 8px;
        cursor: col-resize;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        border-left: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0;
        transition: background 0.15s;
      }
      .resize-handle:hover,
      .resize-handle.active { background: #e2e8f0; }
      .resize-handle-bar {
        width: 2px;
        height: 24px;
        border-radius: 1px;
        background: #cbd5e1;
        transition: background 0.15s;
      }
      .resize-handle:hover .resize-handle-bar,
      .resize-handle.active .resize-handle-bar { background: #94a3b8; }

      .diagram-pane {
        flex: 1;
        min-width: 200px;
        overflow-y: auto;
        padding: 24px;
        background: #f8fafc;
      }

      .diagram {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #94a3b8;
        font-size: 14px;
      }

      /* ── Event nodes ──────────────────────────────────── */

      .event-node {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 600;
      }
      .event-start { background: #ecfdf5; border: 1.5px solid #86efac; color: #166534; }
      .event-start .event-icon { color: #22c55e; font-size: 10px; }
      .event-end { background: #fef2f2; border: 1.5px solid #fca5a5; color: #991b1b; }
      .event-end .event-icon { color: #ef4444; font-size: 10px; }

      /* ── Step nodes ───────────────────────────────────── */

      .step-node {
        width: 220px;
        padding: 12px 16px;
        border-radius: 8px;
        background: #ffffff;
        border: 1.5px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .step-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .step-name { font-weight: 600; font-size: 13px; color: #1e293b; }
      .step-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        flex-shrink: 0;
      }
      .badge-worker { background: #dbeafe; color: #1d4ed8; }
      .badge-system { background: #fef3c7; color: #92400e; }
      .step-desc { margin-top: 6px; font-size: 11px; color: #64748b; line-height: 1.4; }

      /* ── Connectors ───────────────────────────────────── */

      .connector {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 32px;
      }
      .connector-line { width: 2px; flex: 1; background: #cbd5e1; }
      .connector-arrow { font-size: 8px; color: #cbd5e1; line-height: 1; margin-top: -2px; }

      /* ── Error bar ────────────────────────────────────── */

      .error-bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: #fef2f2;
        border-top: 1px solid #fecaca;
        color: #dc2626;
        font-size: 12px;
        flex-shrink: 0;
      }
      .error-bar::before { content: '\\26A0'; }
    `;
  }
}

// ── Plugin ─────────────────────────────────────────────────────────

/**
 * Flow Diagram Plugin — renders JSON artifacts that describe a workflow
 * (with Steps, Transitions, and optionally Events) as an interactive
 * split-view: Monaco JSON editor on the left, live flow diagram on the right.
 *
 * Resize preferences (split width, panel width) are persisted in localStorage.
 * Non-matching JSON artifacts return '' so the default renderer takes over.
 */
export class FlowDiagramPlugin extends ChatPluginBase {
  readonly id = 'flow-diagram';
  readonly name = 'Flow Diagram';
  readonly version = '1.0.0';

  override onInit(): void {
    if (!customElements.get(ELEMENT_TAG)) {
      customElements.define(ELEMENT_TAG, FlowDiagramEditorElement);
    }
  }

  override renderArtifactContent(artifact: ChatbotArtifact): string {
    if (artifact.language !== 'json') return '';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(artifact.content);
    } catch {
      return '';
    }

    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      !parsed.Steps ||
      typeof parsed.Steps !== 'object' ||
      !parsed.Transitions ||
      typeof parsed.Transitions !== 'object'
    ) {
      return '';
    }

    return `<nr-flow-diagram-editor content="${escapeHtml(artifact.content)}"></nr-flow-diagram-editor>`;
  }
}
