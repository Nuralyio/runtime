import { CSSResultGroup, LitElement, css, html, nothing, unsafeCSS } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/input";
import "@hybridui/dropdown";
import "@lit-labs/ssr-dom-shim";
import stylesUrl from "./global.css?url";

@customElement("box-style-panel-editor")
export class BoxStylePanel extends LitElement {
  @state()
  styleLoaded;

  @state()
  editableTabs = [
    {
      label: "Edit",
      content: html` <link rel="stylesheet" href=${stylesUrl} />
        <div class="container auto grid grid-cols-2">
          <div>Visible</div>
          <div>
            <hy-input @valueChange=${console.log}></hy-input>
          </div>
          <div>Position</div>
          <div>
            <hy-input @valueChange=${console.log}></hy-input>
          </div>
          <div>Size</div>
          <div>
            <hy-input @valueChange=${console.log}></hy-input>
          </div>
        </div>`,
    },
    {
      label: "Tab 3",
      content: html`Content for Tab 3`,
    },
  ];

  render() {
    return html`
      <link rel="stylesheet" href=${stylesUrl} />
      <hy-tabs
        .tabs=${this.editableTabs}
        .editable=${{
          canDeleteTab: false,
          canEditTabTitle: false,
          canAddTab: true,
          canMove: true,
        }}
      ></hy-tabs>
    `;
  }
}
