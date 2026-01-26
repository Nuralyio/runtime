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
import "../../../../runtime/components/ui/components/advanced/CodeEditor/CodeEditor";

// Event configurations per component type
const COMPONENT_EVENTS: Record<string, Array<{ name: string; label: string; description: string }>> = {
  text_label: [
    { name: "onClick", label: "On Click", description: "Triggered when the label is clicked" }
  ],
  text_input: [
    { name: "onChange", label: "On Change", description: "Triggered when the value changes" },
    { name: "onFocus", label: "On Focus", description: "Triggered when the input gains focus" },
    { name: "onBlur", label: "On Blur", description: "Triggered when the input loses focus" },
    { name: "onEnter", label: "On Enter", description: "Triggered when Enter key is pressed" }
  ],
  button_input: [
    { name: "onClick", label: "On Click", description: "Triggered when the button is clicked" }
  ],
  checkbox: [
    { name: "onChange", label: "On Change", description: "Triggered when the checkbox state changes" }
  ],
  select: [
    { name: "onChange", label: "On Change", description: "Triggered when selection changes" },
    { name: "onSearch", label: "On Search", description: "Triggered when search input changes" }
  ],
  container: [
    { name: "onClick", label: "On Click", description: "Triggered when the container is clicked" }
  ],
  image: [
    { name: "onClick", label: "On Click", description: "Triggered when the image is clicked" },
    { name: "onLoad", label: "On Load", description: "Triggered when the image loads" },
    { name: "onError", label: "On Error", description: "Triggered when the image fails to load" }
  ],
  form: [
    { name: "onSubmit", label: "On Submit", description: "Triggered when the form is submitted" },
    { name: "onReset", label: "On Reset", description: "Triggered when the form is reset" }
  ]
};

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

    .handler-editor code-editor {
      --editor-height: 120px;
      display: block;
    }
  `;

  @property({ attribute: false })
  component: ComponentElement | null = null;

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
              <code-editor
                language="javascript"
                .code=${code || "// Enter JavaScript code..."}
                @change=${(e: CustomEvent) => this.updateHandler(event.name, e.detail.value)}
              ></code-editor>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  override render() {
    if (!this.component) {
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
