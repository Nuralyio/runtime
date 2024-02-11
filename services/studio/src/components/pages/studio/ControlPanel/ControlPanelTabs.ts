import { LitElement, css, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import "@hybridui/button";
import "@hybridui/tabs";
import "@hybridui/input";
import "@hybridui/table";
import "@hybridui/modal";
import "@hybridui/dropdown";
import "@lit-labs/ssr-dom-shim";
import { useStores } from "@nanostores/lit";
import { $selectedComponent } from "$store/component/sotre";
import { type  ComponentElement, type ComponentType } from "$store/component/interface";
import "./TextAttributes/TextValue/TextAttribute";
import "./TextAttributes/FontSize/FontSizeAttribute";
import "./TextAttributes/FontWeight/FontWeight";
import "./shared/BackgroundColor/BackgroundColor";
import "./TextAttributes/FontStyle/FontStyle";
import "./TextAttributes/TextColor/TextColor";
import "./Event/EventAttribute/EventAttribute";
import "./Styles/BoxShadowAttribute/BoxShadowAttribute";
import "./Styles/BorderAttribute/BorderAttribute";
import "./AdvancedPanelTab";
import "./StylePanelTab";

@customElement("control-panel")export class ParametersPanel extends LitElement {
  static styles = [
    css`
      :host {
        min-width: 340px;
        display: block;
          --hybrid-tabs-content-background-color : #1f2937;
        height:100vh;
          background-color: #2c2c2c;
        overflow-y: auto;


      }
      hy-tabs {
        --hybrid-tabs-content-background-color : #f8fafc;
        font-size: 12px;
      }
      @media (prefers-color-scheme: dark) {
       
        hy-tabs {
          --hybrid-tabs-content-background-color : #2c2c2c;
          color: #f3f3f3;
          
          font-weight: 400;
        }
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
