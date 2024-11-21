import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./EnvironmentSwitcher.style";
import "@nuraly/dropdown";
import "@nuraly/button";
@customElement("top-bar-environment-switcher")
export class TopbarEnvironmentSwitcher extends LitElement {
  static styles = styles;

  render() {
    return html` <div>
      <hy-dropdown
        .options=${[
          {
            label: "Development",
          },
          { type: "divider" },
          {
            label: "Stage",
            children: [
              {
                label: "Stage 1",
              },
              {
                label: "Stage 2",
              },
            ],
          },
          {
            label: "Production",
          },
        ]}
        @change="${(e: any) => { }}"
        ><span slot="label">
          <hy-button icon="box" class="enviroenemnt-swithcer-initiator"
            >Environment (development)</hy-button
          >
        </span></hy-dropdown
      >
    </div>`;
  }
}
