import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $environment, type Environment, ViewMode } from "@shared/redux/store/environment.ts";

import "../control-panel/ControlPanelTabs.ts";

@customElement("right-panel")
export class RightPanel extends LitElement {
  static styles = [css`
     aside {
        display: none;
      }
      :host{
        --nuraly-tabs-content-padding: 20px;
        --nuraly-tabs-content-maring: 10px;
        --nuraly-tabs-container-background-color : white;
      }
      @media (prefers-color-scheme: dark) {
        :host{
        --nuraly-tabs-container-background-color : #313131;

      }
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
    // $context.listen(() => {
    //   this.showSecondsRow = getVar("global", "showSecondsRow").value as boolean;
    // });
  }


  render() {
    return html`

      <aside
        class=" sidebar  flex flex-col ${this.mode === ViewMode.Edit ? "visible" : ""}"
        style="height: 100%; width: 350px; min-width: 350px; max-width: 350px; flex: 0 0 450px;">
        <div class="my-4 w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"></span>
        </div>
        <div class="my flex-grow w-full h-full" style="width:100%">
          <control-panel class="w-full h-full" style=""></control-panel>
        </div>
      </aside>`;
  }
}
