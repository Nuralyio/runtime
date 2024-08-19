import "../ScreenPanel/ScreenStructure";
import { $environment, ViewMode, type Environment } from "$store/environment";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("theme-contaienr")
export class LeftPanel extends LitElement {
  static styles = [
    css`
      .thecontainer {
      --hybrid-tabs-content-background-color: #f8fafc;
      background: #f8fafc;
    }
    @media (prefers-color-scheme: dark) {
        .thecontainer {
        --hybrid-tabs-content-background-color: #313131;
      background: #313131;

        color:#f8fafc;
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
    return html`<div class="thecontainer"><slot></slot></div>`;
  }
}
