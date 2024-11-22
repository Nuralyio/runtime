import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/dropdown";
import "@nuralyui/button";
import styles from "./UserInfo.style";
@customElement("topbar-user-info")
export class TopbarUserInfo extends LitElement {
  static styles = styles;

  render() {
    return html` <hy-dropdown
      .options=${[
        {
          label: "Profile",
        },
        { type: "divider" },
        // {
        //   label: "Stage",
        //   children: [
        //     {
        //       label: "Stage 1",
        //     },
        //     {
        //       label: "Stage 2",
        //     },
        //   ],
        // },
        {
          label: "Logout",
        },
      ]}
      @change="${(e: any) => { }}"
      ><span slot="label">
        <hy-button icon="user" class="user-info-initiator">Aymen</hy-button>
      </span></hy-dropdown
    >`;
  }
}
