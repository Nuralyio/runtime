// CRITICAL: Register all runtime components first
import "../../../../features/runtime/utils/register-components";

import "../../../../features/runtime/components/ui/components/runtime/MicroApp/MicroApp";
import { $environment, type Environment, ViewMode } from '../../../../features/runtime/redux/store/environment';
import { $editorState } from '../../../../features/runtime/redux/store/apps';
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css``
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  currentTabType: string = "page";

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
    $editorState.subscribe((editorState) => {
      this.currentTabType = editorState.currentTab?.type || "page";
    });
  }

  override connectedCallback() {
    super.connectedCallback();

  }

  render() {
    if (this.mode !== ViewMode.Edit) {
      return html``;
    }

    // Use different micro-app for workflow mode
    const componentUUID = this.currentTabType === "flow"
      ? "workflow_left_panel_container"
      : "331";

    return html`
      <div
        class="flex flex-col visible"
        style="height: 100%;width : 300px;"
      >

        <micro-app uuid="1" componentToRenderUUID="${componentUUID}" style="height: 100%;" class="flex-grow"></micro-app>
      </div>
    `;
  }
}