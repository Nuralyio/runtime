import { LitElement, html } from "lit";
import { state, property, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/dropdown";
@customElement("editor-interactive-panel")
export class EditorInteractivePanel extends LitElement {
  render() {
    return html` <slot></slot>`;
  }
}
