import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../ScreenPanel/ScreenStructure";
import { $environment, type Environment, ViewMode } from "$store/environment/store";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      .left-panel {
        background-color: #2c2c2c;
        overflow-y: auto;
        height: 100vh;
      }
    screen-structure-editor{
      --hybrid-menu-background-color: #2c2c2c;
      color : white;
        font-size: 12px;
          font-weight: 400;
          --hybrid-button-border-color: transparent;
    }
    `,
  ];

  @state()
  mode: ViewMode = ViewMode.Edit;

  constructor() {
    super();
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

  render() {
    return html`${this.mode === ViewMode.Edit
      ? html`
          <aside
            class="left-panel sidebar w-80 -translate-x-full transform bg-gray-100 p-4 transition-transform duration-150 ease-in md:translate-x-0 md:shadow-md"
          >
            <div class="my-4 w-full text-center">
              <span class="font-mono text-xl font-bold tracking-widest"> </span>
            </div>
            <div class="my-4">
              <div>
                <screen-structure-editor></screen-structure-editor>
              </div>
            </div>
          </aside>
        `
      : nothing} `;
  }
}
