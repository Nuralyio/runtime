// CRITICAL: Register all runtime components first
import "../../../runtime/utils/register-components";

import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $environment, type Environment, ViewMode } from '../../../runtime/redux/store/environment.ts';
import { $editorState } from '../../../runtime/redux/store/apps.ts';

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
      aside.visible {
        display: flex;
      }`];

  @state()
  mode: ViewMode = ViewMode.Edit;

  @state()
  currentTabType: string = "page";

  showSecondsRow: boolean;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
    $editorState.subscribe((editorState) => {
      this.currentTabType = editorState.currentTab?.type || "page";
    });
  }


  render() {
    // Hide right panel for flow and database tabs
    const shouldShow = this.mode === ViewMode.Edit && this.currentTabType !== "flow" && this.currentTabType !== "database";

    return html`

      <aside
        class=" sidebar  flex flex-col ${shouldShow ? "visible" : ""}"
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
