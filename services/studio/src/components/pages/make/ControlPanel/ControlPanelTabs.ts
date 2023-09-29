import { LitElement, css, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/input";
import "@hybridui/dropdown";
import "@lit-labs/ssr-dom-shim";
import { useStores } from "@nanostores/lit";
import { $selectedComponent } from "$store/component/sotre";
import { ComponentElement, ComponentType } from "$store/component/interface";
import "./Inputs/Text/TextAttribute/TextAttribute";
import "./Styles/FontSizeAttribute/FontSizeAttribute";
import "./Styles/FontWeightAttribute/FontWeightAttribute";
import "./Styles/BackgroundColorAttribute/BackgroundColorAttribute";
import "./Styles/FontStyleAttribute/FontStyleAttribute";
import "./Styles/ColorAttribute/ColorAttribute";
import "./Event/EventAttribute/EventAttribute";
import "./AdvancedPanelTab";
import "./StylePanelTab";

@customElement("control-panel")
@useStores($selectedComponent)
export class ParametersPanel extends LitElement {
  static styles = [
    css`
      :host {
        min-width: 340px;
        display: block;
      }
    `,
  ];

  @state()
  selectedComponent: ComponentElement;

  @state()
  editableTabs = [];

  constructor() {
    super();
    $selectedComponent.subscribe((component: ComponentElement) => {
      this.selectedComponent = { ...component };
      this.editableTabs = [
        {
          label: "Parameters",
          content: html`<style-panel
            .component=${{ ...this.selectedComponent }}
          ></style-panel>`,
        },

        {
          label: "Advanced",
          content: html`<advanced-panel
            .component=${{ ...this.selectedComponent }}
          ></advanced-panel>`,
        },
      ];
    });
  }

  render() {
    return html`
      <hy-tabs
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
