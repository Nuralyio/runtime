import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./ActionBar.style";
import "./AppActions/AppActions";
import "./ScreenActions/ScreenActions";

@customElement("topbar-action-bar")
export class TopbarActionBar extends LitElement {
  static styles = styles;

  render() {
    return html`
      <div class="action-bar">
        <topbar-screen-actions></topbar-screen-actions >
    
        <span style="color:white;margin-left: auto;margin-top: 6px;" contenteditable="true">Company Poral</span>
        <topbar-app-actions class="app-action-info"></topbar-app-actions>
      </div>
    `;
  }
}
