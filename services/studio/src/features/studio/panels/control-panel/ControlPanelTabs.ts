import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $editorState } from '@nuraly/runtime/redux/store';

// Import native control panel component
import "./StudioControlPanel.ts";

/**
 * Control Panel Component
 * Native implementation replacing micro-app based control panel
 */
@customElement("control-panel")
export class ParametersPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    studio-control-panel {
      height: 100%;
    }
  `;

  @state()
  private currentTab = { type: "page" };

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribe = $editorState.subscribe((editorState) => {
      setTimeout(() => {
        this.currentTab = editorState.currentTab;
        this.requestUpdate();
      }, 0);
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  render() {
    return html`
      <studio-control-panel></studio-control-panel>
    `;
  }
}
