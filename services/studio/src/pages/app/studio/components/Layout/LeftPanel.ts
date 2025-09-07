import "../ScreenPanel/ScreenStructure";
import { $environment, type Environment, ViewMode } from "$store/environment";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      hy-tabs {
        font-size: 12px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      :host{
        --hybrid-tabs-content-padding: 20px;
        --hybrid-tabs-content-maring: 10px;
        --hybrid-tabs-container-background-color : white;
        --hybrid-tabs-content-height: calc(100vh - 100px);
        --hybrid-tabs-content-overflow-y: auto;
        --hybrid-tabs-content-max-height: calc(100vh - 100px);
      }
       
      @media (prefers-color-scheme: dark) {
        hy-tabs {
          --hybrid-tabs-content-background-color: #2c2c2c;
          color: #f3f3f3;
          font-weight: 400;
        }
        :host{
          --hybrid-tabs-container-background-color : #313131;
        }
      }
      aside {
        display: none;
        height: 100vh;
        max-height: 100vh;
        overflow: hidden;
      }
      aside.visible {
        display: flex;
      }
      
      screen-structure-editor {
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      micro-app {
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
    `
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  constructor() {
    super();

  }

  override connectedCallback() {
    super.connectedCallback();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

  render() {
    return html`
      <aside
        class="flex flex-col ${this.mode === ViewMode.Edit ? "visible" : ""}"
        style="height: 100vh; width: 300px; max-height: 100vh; overflow: hidden;"
      >
        <div class="w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"> </span>
        </div>
        <screen-structure-editor style="height: calc(100vh - 60px); overflow: hidden;" class="flex-grow"></screen-structure-editor>
      </aside>
    `;
  }
}