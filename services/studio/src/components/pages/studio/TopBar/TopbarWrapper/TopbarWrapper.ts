import { LitElement, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import styles from "./TopbarWrapper.style";
import "../UserEnvironment/UserEnvironment";
import "../ActionBar/ActionBar";

@customElement("topbar-panel-wrapper")
export class TopbarPanelWrapper extends LitElement {
  static override styles = styles;
  render() {
    return html`
    <div class="topbar-wrapper">
     <micro-app uuid="1" componentToRenderUUID="top-bar"></micro-app>
    </div>`;
  }
}
