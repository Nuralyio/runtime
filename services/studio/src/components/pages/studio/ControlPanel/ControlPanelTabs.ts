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
import { $applicationComponents, $selectedComponent } from "$store/component/sotre";
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
import { $currentApplication } from "$store/apps";
import { $context, getVar } from "$store/context/store";

@customElement("control-panel")
export class ParametersPanel extends LitElement {
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


  @state()
  selectedComponentIds = [];
  
  constructor() {
    super();
    $context.subscribe(() => {
     this.selectedComponentIds =  (getVar("global", "selectedComponents")?.value||[]);
     console.log('selectedomponents ',this.selectedComponentIds)
     $applicationComponents($currentApplication.get().uuid).subscribe((components: ComponentElement[]) => { 
      components = components.filter((component: ComponentElement) => this.selectedComponentIds.includes(component.uuid));
      if(components.length) {
        this.selectedComponent = { ...components[0] };
      }else{
        this.selectedComponent = null;
      }
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
     })
    })
  }

  render() {
    return html`
    <div style="color:white">
      ${this.selectedComponent ? html`
        <micro-app uuid="1" componentToRenderUUID="right_panel_tabs"></micro-app>
        ` : html`<div> Select a component to edit </div>`
      }
      <hy-tabs
        .tabs=${this.editableTabs}
        .editable=${{
          canDeleteTab: false,
          canEditTabTitle: false,
          canAddTab: false,
          canMove: false,
        }}
      ></hy-tabs>

    </div>
      
    `;
  }
}
