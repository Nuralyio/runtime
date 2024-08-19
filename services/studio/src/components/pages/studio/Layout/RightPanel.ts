import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { $environment, type Environment, ViewMode } from "$store/environment";

import "../ControlPanel/ControlPanelTabs";
@customElement("right-panel")
export class RightPanel extends LitElement {
  static styles = [css``];

  @state()
  mode: ViewMode = ViewMode.Edit;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

 

  render() {
    return html` ${this.mode === ViewMode.Edit
      ? html`<aside class="sidebar w-96 -translate-x-full transform p-4 transition-transform duration-150 ease-in md:translate-x-0 md:shadow-md flex flex-col" style="height: 100%;">
      <div class="my-4 w-full text-center">
        <span class="font-mono text-xl font-bold tracking-widest"></span>
      </div>
      <div class="my-4 flex-grow" style="width:355px;height: 100%">
        <control-panel class="w-full h-full"  style="width:355px;height: 100%"></control-panel>
      </div>
    </aside>`
      : nothing}`;
  }
}
