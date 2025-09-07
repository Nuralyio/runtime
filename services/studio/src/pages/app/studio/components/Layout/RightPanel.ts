import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $environment, type Environment, ViewMode } from "$store/environment.ts";

import "../ControlPanel/ControlPanelTabs.ts";

@customElement("right-panel")
export class RightPanel extends LitElement {
  static styles = [css`
     aside {
        display: none;
      }
      :host{
        --hybrid-tabs-content-padding: 20px;
        --hybrid-tabs-content-maring: 10px;
        --hybrid-tabs-container-background-color : white;
        --hybrid-tabs-content-height: calc(100vh - 110px);
        --hybrid-tabs-content-overflow-y: auto;
        --hybrid-tabs-content-max-height: calc(100vh - 110px);
      }
      @media (prefers-color-scheme: dark) {
        :host{
        --hybrid-tabs-container-background-color : #313131;

      }
    }
      aside.visible {
        display: flex;
      }
      
      /* Ensure hy-tabs content scrolls properly */
      ::slotted(hy-tabs) {
        height: 100% !important;
        overflow: hidden !important;
      }
      
      ::slotted(hy-tabs) [slot="content"] {
        height: calc(100vh - 160px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }`];

  @state()
  mode: ViewMode = ViewMode.Edit;
  showSecondsRow: boolean;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
    // $context.listen(() => {
    //   this.showSecondsRow = getVar("global", "showSecondsRow").value as boolean;
    // });
  }


  render() {
    return html`

      <aside
        class=" sidebar w-96 -translate-x-full transform p-4 transition-transform duration-150 ease-in md:translate-x-0 md:shadow-md flex flex-col ${this.mode === ViewMode.Edit ? "visible" : ""}"
        style="height: 100vh; max-height: 100vh; overflow: hidden;">
        <div class="my-4 w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"></span>
        </div>
        <div class="my flex-grow" style="width:290px; height: calc(100vh - 100px); margin:10px; overflow: hidden;">
          <control-panel class="w-full h-full" style="width:345px; height: 100%; overflow: hidden;"></control-panel>
        </div>
      </aside>`;
  }
}
