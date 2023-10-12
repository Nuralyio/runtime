import { LitElement, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import styles from "./TopbarWrapper.style";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/dropdown";
import "../UserEnvironment/UserEnvironment";
import "../ActionBar/ActionBar";

@customElement("topbar-panel-wrapper")
export class TopbarPanelWrapper extends LitElement {
  static override styles = styles;
  render() {
    return html`<div class="topbar-wrapper">
      <topbar-user-environment></topbar-user-environment>
     
    </div>`;
  }
}
