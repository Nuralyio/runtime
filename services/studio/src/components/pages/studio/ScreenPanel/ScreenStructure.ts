import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@hybridui/menu";
import "@hybridui/icon";
import "./ScreenList";
import "./AddScreen";
import "@hybridui/button";
import  "../Data/Datasource/Datasource";


@customElement("screen-structure-editor")
export class ScreenStructureEditor extends LitElement {


  constructor() {
    super();
    this.editableTabs = [
        {
          label: "Pages",
          content: html` <div>
        <add-screen-editor></add-screen-editor>
      </div>
      <screen-list-editor></screen-list-editor>`,
        },

        {
          label: "Data source",
          content: html`<data-soucres></data-soucres>`,
        },
      ];
     
  }

  @state()
  editableTabs = [];


  render() {
    return html`
<div style="min-width : 300px">
</div>
  <hy-tabs
  .activeTab=${0}
        .tabs=${this.editableTabs}
        .editable=${{
          canDeleteTab: false,
          canEditTabTitle: false,
          canAddTab: false,
          canMove: false,
        }}
      ></hy-tabs>

     
    `;
  }
}
