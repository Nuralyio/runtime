import "../ScreenPanel/ScreenStructure";
import { $environment, ViewMode, type Environment } from "$store/environment";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      hy-tabs {
        --hybrid-tabs-content-background-color: #f8fafc;
        font-size: 12px;
      }
      @media (prefers-color-scheme: dark) {
        hy-tabs {
          --hybrid-tabs-content-background-color: #2c2c2c;
          color: #f3f3f3;
          font-weight: 400;
        }
      }
      aside {
        display: none;
      }
      aside.visible {
        display: flex;
      }
    `,
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  constructor() {
    super();
   
  }
  override connectedCallback() {
    super.connectedCallback();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode
      this.requestUpdate(); 
    });
  }
  render() {
    return html`
      <aside
        class="flex flex-col ${this.mode === ViewMode.Edit ? 'visible' : ''}"
        style="height: 100%;width : 300px;"
      >
        <div class="w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"> </span>
        </div>
        <screen-structure-editor style="height: 100%;" class="flex-grow"></screen-structure-editor>
      </aside>
    `;
  }
}