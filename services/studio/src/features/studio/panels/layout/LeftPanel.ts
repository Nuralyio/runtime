// CRITICAL: Register all runtime components first
import "../../../../features/runtime/utils/register-components";

import "../../../../features/runtime/components/ui/components/runtime/MicroApp/MicroApp";
import { $environment, type Environment, ViewMode } from '../../../../features/runtime/redux/store/environment';
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css``
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  constructor() {
    super();
 $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

  override connectedCallback() {
    super.connectedCallback();
   
  }

  render() {
    if (this.mode !== ViewMode.Edit) {
      return html``;
    }

    return html`
      <div
        class="flex flex-col visible"
        style="height: 100%;width : 300px;"
      >

        <micro-app uuid="1" componentToRenderUUID="331" style="height: 100%;" class="flex-grow"></micro-app>
      </div>
    `;
  }
}