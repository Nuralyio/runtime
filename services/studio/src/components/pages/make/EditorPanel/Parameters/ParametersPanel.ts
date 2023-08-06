import { LitElement, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/input";
import "@hybridui/dropdown";
import "@lit-labs/ssr-dom-shim";
import stylesUrl from "./global.css?url";
import { useStores } from "@nanostores/lit";
import { $selectedComponent } from "$store/component/sotre";
import { ComponentElement, ComponentType } from "$store/component/interface";
import "./AttributesParameters/TextAttributes/TextAttributes";
import "./AttributesParameters/FontSizeAttribute/FontSizeAttribute";
import "./AttributesParameters/FontWeightAttribute/FontWeightAttribute";
import "./AttributesParameters/BackgroundColorAttribute/BackgroundColorAttribute";
@customElement("box-style-panel-editor")
@useStores($selectedComponent)
export class BoxStylePanel extends LitElement {
  @state()
  selectedComponent: ComponentElement;
  constructor() {
    super();
    $selectedComponent.subscribe((component: ComponentElement) => {
      this.selectedComponent = { ...component };
      this.editableTabs = [
        {
          label: "Parameters",
          content: html`${this.renderParameters(this.selectedComponent)}`,
        },
      ];
    });
  }

  @state()
  editableTabs = [];

  renderParameters(component: ComponentElement) {
    let templates = [];
    switch (component?.type) {
      case ComponentType.TextLabel:
        templates.push([
          html`<parameters-text-label
            .component=${component}
          ></parameters-text-label>`,
          html`<attribute-text-font-size
            .component=${component}
          ></attribute-text-font-size>`,
          html`<attribute-text-font-weight
            .component=${component}
          ></attribute-text-font-weight>`,
          html`<attribute-background-color
            .component=${component}
          ></attribute-background-color>`,
        ]);
    }
    return templates;
  }
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
