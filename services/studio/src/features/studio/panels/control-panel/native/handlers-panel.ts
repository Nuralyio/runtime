/**
 * Native Handlers Panel
 *
 * Displays and allows editing of component event handlers.
 * Direct read/write to component.event without low-code mechanism.
 */

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { updateComponentAttributes } from "../../../../runtime/redux/actions/component/updateComponentAttributes";
import type { ComponentElement } from "../../../../runtime/redux/store/component/component.interface";
import type { PageElement } from "../../../../runtime/redux/handlers/pages/page.interface";
import "@nuralyui/code-editor";
import { COMPONENT_EVENTS } from "../../../core/properties/registry";
import { updatePageHandler } from "../../../../runtime/redux/handlers/pages/handler";

// Page-level events
const PAGE_EVENTS = [
  { name: "onInit", label: "On Init", description: "Triggered when the page initializes" },
  { name: "onUnload", label: "On Unload", description: "Triggered when the page unloads" },
  { name: "onResize", label: "On Resize", description: "Triggered when the page resizes" },
];

@customElement("native-handlers-panel")
export class NativeHandlersPanel extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 8px 0;
    }

    .handler-item {
      border-bottom: 1px solid var(--border-color, #e0e0e0);
    }

    .handler-item:last-child {
      border-bottom: none;
    }

    .handler-header {
      padding: 8px 12px;
      cursor: pointer;
      user-select: none;
    }

    .handler-header:hover {
      background: var(--bg-hover, #f5f5f5);
    }

    .handler-content {
      padding: 8px 12px;
      border-top: 1px solid var(--border-color, #e0e0e0);
    }

    .handler-editor {
      margin-top: 8px;
    }

    .handler-editor nr-code-editor {
      --nuraly-code-editor-height: 120px;
      display: block;
    }
  `;

  @property({ attribute: false })
  component: ComponentElement | null = null;

  @property({ attribute: false })
  page: PageElement | null = null;

  @state()
  private expandedHandlers: Set<string> = new Set();

  private getHandlerCode(eventName: string): string {
    if (!this.component?.event) return "";
    return this.component.event[eventName] ?? "";
  }

  private hasHandler(eventName: string): boolean {
    const code = this.getHandlerCode(eventName);
    return code.trim().length > 0;
  }

  private updateHandler(eventName: string, code: string) {
    if (!this.component) return;

    updateComponentAttributes(
      this.component.application_id,
      this.component.uuid,
      "event",
      { [eventName]: code },
      true
    );
  }

  private toggleHandler(eventName: string) {
    const newExpanded = new Set(this.expandedHandlers);
    if (newExpanded.has(eventName)) {
      newExpanded.delete(eventName);
    } else {
      newExpanded.add(eventName);
    }
    this.expandedHandlers = newExpanded;
  }

  // === Page Handler Methods ===

  private getPageHandlerCode(eventName: string): string {
    if (!this.page?.event) return "";
    return this.page.event[eventName] ?? "";
  }

  private hasPageHandler(eventName: string): boolean {
    const code = this.getPageHandlerCode(eventName);
    return code.trim().length > 0;
  }

  private updatePageHandler(eventName: string, code: string) {
    if (!this.page) return;

    const currentEvents = this.page.event || {};
    const updatedPage = {
      ...this.page,
      event: { ...currentEvents, [eventName]: code }
    };
    updatePageHandler(updatedPage);
  }

  private renderPageHandler(event: { name: string; label: string; description: string }) {
    const hasCode = this.hasPageHandler(event.name);
    const code = this.getPageHandlerCode(event.name);
    const isExpanded = this.expandedHandlers.has(event.name) || hasCode;

    return html`
      <div class="handler-item">
        <div class="handler-header" @click=${() => this.toggleHandler(event.name)}>
          <nr-row gutter="8" align="middle">
            <nr-col flex="none">
              <nr-icon name=${isExpanded ? "chevron-down" : "chevron-right"} size="14"></nr-icon>
            </nr-col>
            <nr-col flex="auto">
              <nr-label size="small">${event.label}</nr-label>
            </nr-col>
            <nr-col flex="none">
              <nr-tag size="small" variant=${hasCode ? "success" : "default"}>
                ${hasCode ? "Active" : "Empty"}
              </nr-tag>
            </nr-col>
          </nr-row>
        </div>
        ${isExpanded ? html`
          <div class="handler-content">
            <nr-label size="small" variant="secondary">${event.description}</nr-label>
            <div class="handler-editor">
              <nr-code-editor
                language="javascript"
                .code=${code || "// Enter JavaScript code..."}
                @nr-change=${(e: CustomEvent) => this.updatePageHandler(event.name, e.detail.value)}
              ></nr-code-editor>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  private renderHandler(event: { name: string; label: string; description: string }) {
    const hasCode = this.hasHandler(event.name);
    const code = this.getHandlerCode(event.name);
    const isExpanded = this.expandedHandlers.has(event.name) || hasCode;

    return html`
      <div class="handler-item">
        <div class="handler-header" @click=${() => this.toggleHandler(event.name)}>
          <nr-row gutter="8" align="middle">
            <nr-col flex="none">
              <nr-icon name=${isExpanded ? "chevron-down" : "chevron-right"} size="14"></nr-icon>
            </nr-col>
            <nr-col flex="auto">
              <nr-label size="small">${event.label}</nr-label>
            </nr-col>
            <nr-col flex="none">
              <nr-tag size="small" variant=${hasCode ? "success" : "default"}>
                ${hasCode ? "Active" : "Empty"}
              </nr-tag>
            </nr-col>
          </nr-row>
        </div>
        ${isExpanded ? html`
          <div class="handler-content">
            <nr-label size="small" variant="secondary">${event.description}</nr-label>
            <div class="handler-editor">
              <nr-code-editor
                language="javascript"
                .code=${code || "// Enter JavaScript code..."}
                @nr-change=${(e: CustomEvent) => this.updateHandler(event.name, e.detail.value)}
              ></nr-code-editor>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  override render() {
    // If no component selected, show page handlers
    if (!this.component) {
      if (this.page) {
        return html`
          <div style="padding: 0 12px 8px;">
            <nr-label size="small" variant="secondary">Page Handlers</nr-label>
          </div>
          ${PAGE_EVENTS.map(event => this.renderPageHandler(event))}
        `;
      }
      return html`
        <nr-row justify="center" style="padding: 16px;">
          <nr-col>
            <nr-label size="small" variant="secondary">No component selected</nr-label>
          </nr-col>
        </nr-row>
      `;
    }

    const events = COMPONENT_EVENTS[this.component.type] || [];

    if (events.length === 0) {
      return html`
        <nr-row justify="center" style="padding: 16px;">
          <nr-col>
            <nr-label size="small" variant="secondary">No handlers available for this component type</nr-label>
          </nr-col>
        </nr-row>
      `;
    }

    return html`${events.map(event => this.renderHandler(event))}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "native-handlers-panel": NativeHandlersPanel;
  }
}
