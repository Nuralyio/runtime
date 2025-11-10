import "@shared/ui/components/runtime/MicroApp/MicroApp";
import { $environment, type Environment, ViewMode } from "@shared/redux/store/environment";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("left-panel")
export class LeftPanel extends LitElement {
  static styles = [
    css``
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
        style="height: 100%;width : 100%;"
      >
        <div class="w-full text-center">
          <span class="font-mono text-xl font-bold tracking-widest"> </span>
        </div>
        <micro-app uuid="1" componentToRenderUUID="331" style="height: 100%;" class="flex-grow"></micro-app>
      </aside>
    `;
  }
}