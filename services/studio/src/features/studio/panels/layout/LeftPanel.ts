// CRITICAL: Register all runtime components first
import "../../../../features/runtime/utils/register-components";

// Import native left panel component
import "../left-panel/StudioLeftPanel.ts";

import { $environment, type Environment, ViewMode } from '../../../../features/runtime/redux/store/environment';
import { $editorState } from '../../../../features/runtime/redux/store/apps';
import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
        height: 100%;
        width: 300px;
      }
      :host(.hidden) {
        display: none;
      }
    `
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  private unsubscribeEnvironment?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeEnvironment = $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
      this.updateVisibility();
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEnvironment?.();
  }

  private updateVisibility() {
    if (this.mode !== ViewMode.Edit) {
      this.classList.add('hidden');
    } else {
      this.classList.remove('hidden');
    }
  }

  render() {
    if (this.mode !== ViewMode.Edit) {
      return nothing;
    }

    return html`
      <studio-left-panel></studio-left-panel>
    `;
  }
}