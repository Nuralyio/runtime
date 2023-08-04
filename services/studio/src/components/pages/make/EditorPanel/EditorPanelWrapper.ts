import { LitElement, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/dropdown";
import { StoreController } from "@nanostores/lit";

import { $component, addComponent } from "../../../../store/apps";
@customElement("editor-panel-wranner")
export class EditorPanelWrapper extends LitElement {
  private componentController = new StoreController(this, $component);

  render() {
    return html` <slot></slot>`;
  }
}
