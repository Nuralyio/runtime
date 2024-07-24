import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@hybridui/menu";
import "@hybridui/icon";
import "./ScreenList";
import "./AddScreen";
import "../../../../core/components/micro-app";
import "@hybridui/button";
import "../Data/Datasource/Datasource";


@customElement("screen-structure-editor")
export class ScreenStructureEditor extends LitElement {


  constructor() {
    super();


  }

  @state()
  editableTabs = [];


  render() {
    return html`


<micro-app uuid="1" componentToRenderUUID="331"></micro-app>

     
    `;
  }
}
