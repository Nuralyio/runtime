import { LitElement, css, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import { $applicationComponents }
  from "$store/component/store.ts";
import { type ComponentElement } from "$store/component/interface.ts";
import { $currentApplication } from "$store/apps.ts";
import { $context, getVar } from "$store/context.ts";

@customElement("control-panel")
export class ParametersPanel extends LitElement {
  static styles = css` 
   micro-app{
     --hybrid-input-border-radius:7px;
     --hybrid-input-border-bottom: 1px solid #a8a8a8;
     --hybrid-input-border-top: 1px solid #a8a8a8;
     --hybrid-input-border-left: 1px solid #a8a8a8;
     --hybrid-input-border-right: 1px solid #a8a8a8;
     --hybrid-input-focus-border: 1px solid gray;
     --hybrid-input-number-icons-container-width:48px;

     --hybrid-select-small-height: 28px;
     --hybrid-select-icon-width: 11px;
     --hybrid-select-border-bottom: 1px solid #a8a8a8;
     --hybrid-select-border-top: 1px solid #a8a8a8;
     --hybrid-select-border-left: 1px solid #a8a8a8;
     --hybrid-select-border-right: 1px solid #a8a8a8;
     --hybrid-select-border-radius: 7px;
     --hybrid-select-focus-border: 1px solid gray;

     --hybrid-button-background-color: #f4f4f4;
     --hybrid-button-text-color: #535353;
     --hybrid-button-border-left: 1px solid #a8a8a8 ;
     --hybrid-button-border-right: 1px solid #a8a8a8 ;
     --hybrid-button-border-top: 1px solid #a8a8a8 ;
     --hybrid-button-border-bottom: 1px solid #a8a8a8 ;
     
     --hy-collapse-content-background-color: transparent;
    }
    @media (prefers-color-scheme: dark) {
      micro-app{
        --hybrid-input-focus-border: 1px solid #ffffff;
        
        --hybrid-select-focus-border: 1px solid #ffffff;
        
        --hybrid-button-border-left: 1px solid #a8a8a8 ;
        --hybrid-button-border-right: 1px solid #a8a8a8 ;
        --hybrid-button-border-top: 1px solid #a8a8a8 ;
        --hybrid-button-border-bottom: 1px solid #a8a8a8;
        --hybrid-button-background-color: #000000;
        --hybrid-button-text-color: #ffffff;


        
        --hy-collapse-border: 1px solid #a8a8a8;  
        --hy-collapse-header-hover-background-color: #3a3a3a;
        --hy-collapse-header-collapsed-background-color: #3a3a3a;
      }
      
   }
  
   

  `;

  @state() selectedComponent: ComponentElement | null = null;
  @state() editableTabs = [];

  constructor() {
    super();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    $context.subscribe(() => {
      const selectedComponentIds = (getVar("global", "selectedComponents")?.value || []);
      $applicationComponents($currentApplication.get().uuid).subscribe((components: ComponentElement[]) => {
        const selectedComponents = components.filter((component: ComponentElement) => selectedComponentIds.includes(component.uuid));
        this.selectedComponent = selectedComponents.length ? { ...selectedComponents[0] } : null;
      });
    });
  }

  render() {
    return html`
      <micro-app uuid="1" componentToRenderUUID="right_panel_tabs"></micro-app>
    `;
  }
}