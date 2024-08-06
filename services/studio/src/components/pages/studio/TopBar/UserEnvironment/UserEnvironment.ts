import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./UserEnvironment.style";
import "./AppInfo/AppInfo";
import "./EnvironmentSwitcher/EnvironmentSwitcher";
import "./UserInfo/UserInfo";
import "./AppPermission/AppPermission"
@customElement("topbar-user-environment")
export class TopbarUserEnvironment extends LitElement {
  static styles = styles;

  render() {
    return html`<div class="user-environment-bar">
      <!-- <topbar-drawer></topbar-drawer> -->
      <!-- <topbar-app-info></topbar-app-info> -->
      <topbar-action-bar></topbar-action-bar>
    
      <!-- <app-permission></app-permission> -->
      <!-- <topbar-user-info></topbar-user-info> -->
    </div>`;
  }
}
