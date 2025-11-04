import "../screen-panel/ScreenStructure.ts";
import { $environment, type Environment, ViewMode } from "@shared/redux/store/environment.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("theme-contaienr")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      .thecontainer {
      --nuraly-tabs-content-background-color: #f8fafc;
      background: #f8fafc;
    }
    @media (prefers-color-scheme: dark) {
        .thecontainer {
        --nuraly-tabs-content-background-color: #313131;
      background: #313131;

        color:#f8fafc;
      }
    }
    `
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
    return html`<div class="thecontainer"><slot></slot></div>`;
  }
}
