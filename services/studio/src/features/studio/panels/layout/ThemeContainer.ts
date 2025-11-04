import "../screen-panel/ScreenStructure.ts";
import { $environment, type Environment, ViewMode } from "@shared/redux/store/environment.ts";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("theme-contaienr")
export class LeftPanel extends LitElement {
  static styles = [
    css`
     
 
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
