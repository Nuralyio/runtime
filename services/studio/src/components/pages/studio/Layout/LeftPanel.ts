import "../ScreenPanel/ScreenStructure";
import { $environment, ViewMode, type Environment } from "$store/environment/environment-store";
import { LitElement, css, html, nothing } from "lit";
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
            class=""
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
