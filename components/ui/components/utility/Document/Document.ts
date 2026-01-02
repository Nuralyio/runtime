import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/document
try {
  await import("@nuralyui/document");
} catch (error) {
  console.warn('[@nuralyui/document] Package not found or failed to load.');
}

@customElement("document-block")
export class DocumentBlock extends BaseElementBlock {
  static styles = [css`
    .document-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      min-height: 200px;
      border-radius: 8px;
      border: 2px dashed #cbd5e1;
      gap: 12px;
    }
    .document-placeholder nr-icon {
      --nuraly-icon-size: 48px;
    }
  `];

  @property({ type: Object })
  component: ComponentElement;

  renderComponent() {
    const documentStyles = this.getStyles() || {};
    const documentStyleHandlers = this.component?.style_handlers ? Object.fromEntries(
      Object.entries(this.component?.style_handlers).filter(([key, value]) => value)) : {};

    const src = this.resolvedInputs?.src;
    const type = this.resolvedInputs?.type ?? 'pdf';
    const previewable = this.resolvedInputs?.previewable ?? false;

    // Show placeholder when no document source
    if (!src) {
      return html`
        <div
          ${ref(this.inputRef)}
          class="document-placeholder"
          style=${styleMap({
            ...this.getStyles(),
            width: documentStyleHandlers?.width || documentStyles?.width || '100%',
            height: documentStyleHandlers?.height || documentStyles?.height || '200px',
          })}
          @click=${(e: MouseEvent) => this.executeEvent("onClick", e)}
        >
          <nr-icon name="file-text"></nr-icon>
          <nr-label>No document source</nr-label>
        </div>
      `;
    }

    return html`
      <nr-document-viewer
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
        })}
        .src=${src}
        .type=${type}
        .previewable=${previewable}
        .width=${documentStyleHandlers?.width || documentStyles?.width}
        .height=${documentStyleHandlers?.height || documentStyles?.height}
        @click=${(e: MouseEvent) => this.executeEvent("onClick", e)}
        @load=${(e: Event) => this.executeEvent("onLoad", e, { src })}
        @error=${(e: Event) => this.executeEvent("onError", e, { src, error: 'Failed to load document' })}
      >
      </nr-document-viewer>
    `;
  }
}
