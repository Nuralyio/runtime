import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../ScreenPanel/ScreenStructure";
import { $environment, Environment, ViewMode } from "$store/environment/store";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
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
            class="sidebar w-80 -translate-x-full transform bg-gray-100 p-4 transition-transform duration-150 ease-in md:translate-x-0 md:shadow-md"
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
