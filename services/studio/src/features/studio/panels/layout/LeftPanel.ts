// CRITICAL: Register all runtime components first
import "../../../../features/runtime/utils/register-components";

import "../../../../features/runtime/components/ui/components/runtime/MicroApp/MicroApp";
import { $environment, type Environment, ViewMode } from '../../../../features/runtime/redux/store/environment';
import { $editorState } from '../../../../features/runtime/redux/store/apps';
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css``
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  currentTabType: string = "page";

  private unsubscribeEnvironment?: () => void;
  private unsubscribeEditorState?: () => void;
  private initialized = false;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribeEnvironment = $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });

    this.unsubscribeEditorState = $editorState.subscribe((editorState) => {
      // Don't update until we've initialized from URL
      if (!this.initialized) return;

      const stateTabType = editorState.currentTab?.type;
      if (stateTabType && stateTabType !== this.currentTabType) {
        this.currentTabType = stateTabType;
      }
    });
  }

  override firstUpdated() {
    // Set initial tab from URL after first render
    if (typeof window !== "undefined") {
      const urlTabType = (window as any).__TAB_TYPE__;
      if (urlTabType) {
        this.currentTabType = urlTabType;
      }
    }
    this.initialized = true;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribeEnvironment?.();
    this.unsubscribeEditorState?.();
  }

  private getComponentUUID(): string {
    if (this.currentTabType === "flow") {
      return "workflow_left_panel_container";
    } else if (this.currentTabType === "database") {
      return "database_left_panel_container";
    }
    return "331"; // Default pages left panel
  }

  render() {
    if (this.mode !== ViewMode.Edit) {
      return html``;
    }

    const componentUUID = this.getComponentUUID();

    return html`
      <div
        class="flex flex-col visible"
        style="height: 100%;width : 300px;"
      >
        ${keyed(componentUUID, html`
          <micro-app uuid="1" componentToRenderUUID="${componentUUID}" style="height: 100%;" class="flex-grow"></micro-app>
        `)}
      </div>
    `;
  }
}