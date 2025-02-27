import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $environment, type Environment, ViewMode } from "$store/environment.ts";

import "../ControlPanel/ControlPanelTabs.ts";
import { $context, getVar } from "$store/context.ts";

@customElement("right-panel")
export class RightPanel extends LitElement {
  static styles = [css`
     aside {
        display: none;
      }
      :host{
        --hybrid-tabs-content-padding: 20px;
        --hybrid-tabs-content-maring: 10px;
      }
      aside.visible {
        display: flex;
      }`];

  @state()
  mode: ViewMode = ViewMode.Edit;
  showSecondsRow: boolean;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
    $context.listen(() => {
      this.showSecondsRow = getVar("global", "showSecondsRow").value as boolean;
    });
  }


  render() {
    return html`

      <aside
        class=" sidebar w-96 -translate-x-full transform p-4 transition-transform duration-150 ease-in md:translate-x-0 md:shadow-md flex flex-col ${this.mode === ViewMode.Edit ? "visible" : ""}"
        style="height: 100%;">
        <div class="my-4 w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"></span>
        </div>
        <div class="my flex-grow" style="width:290px;height: 100%; margin:10px">
          <control-panel class="w-full h-full" style="width:345px;height: 100%;"></control-panel>
        </div>
      </aside>`;
  }
}
