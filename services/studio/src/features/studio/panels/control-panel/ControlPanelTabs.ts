import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { type ComponentElement } from '@nuraly/runtime/redux/store';
import { $editorState } from '@nuraly/runtime/redux/store';
import { isServer } from "@nuraly/runtime/utils/envirement";

 let filesAppUUID = "" ;
 let rightMenuUUID = "" ;
if(!isServer){
 filesAppUUID = window.__MODULES_CONFIG__.files.app_uuid;
 rightMenuUUID = window.__MODULES_CONFIG__.files.right_file_component_uuid;
}

/**
 * Control Panel Component
 */
@customElement("control-panel")
export class ParametersPanel extends LitElement {
  /**
   * Styles for the component
   */
  static styles = css`

  :host{}
      /* ===============================
         Micro-App Styles
         =============================== */

      micro-app {
          /* Input Styles */
          --nuraly-input-border-radius: 5px;
          /* --nuraly-input-border-bottom: 1px solid #a8a8a8;
          --nuraly-input-border-top: 1px solid #a8a8a8;
          --nuraly-input-border-left: 1px solid #a8a8a8;
          --nuraly-input-border-right: 1px solid #a8a8a8;*/
          --nuraly-input-border-bottom: 2px solid transparent;
          --nuraly-input-number-icons-container-width: 48px;
          --nuraly-input-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
          --nuraly-input-font-size: 12px;

          /* Select Styles */
          --nuraly-select-icon-width: 11px;
          --nuraly-select-border-bottom: 1px solid #a8a8a8;
          --nuraly-select-border-top: 1px solid #a8a8a8;
          --nuraly-select-border-left: 1px solid #a8a8a8;
          --nuraly-select-border-right: 1px solid #a8a8a8;
          --nuraly-select-border-radius: 5px;
          --nuraly-select-focus-border: 1px solid gray;

          /* Button Styles */
          --nuraly-button-background-color: rgb(245, 245, 245);;
          --nuraly-button-text-color: #535353;
          --nuraly-button-border-left: 1px solid #a8a8a8;
          --nuraly-button-border-right: 1px solid #a8a8a8;
          --nuraly-button-border-top: 1px solid #a8a8a8;
          --nuraly-button-border-bottom: 1px solid #a8a8a8;

          /* Collapse Styles */
          --nr-collapse-content-background-color: transparent;
      }

      /* ===============================
         Dark Mode Styles
         =============================== */
      
         @media (prefers-color-scheme: dark) {
          micro-app {
              /* Input Styles (Dark Mode) */

              /* Select Styles (Dark Mode) */
              --nuraly-input-border-bottom: 1px solid transparent;
              --nuraly-input-border-top: 1px solid transparent;
              --nuraly-input-border-left: 1px solid transparent;
              --nuraly-input-border-right: 1px solid transparent;
              --nuraly-input-focus-border: 1px solid #a8a8a8;

              --nuraly-select-focus-border: 1px solid #ffffff;

              /* Button Styles (Dark Mode) */
              --nuraly-button-border-left: 1px solid #272626;
              --nuraly-button-border-right: 1px solid #272626;
              --nuraly-button-border-top: 1px solid #272626;
              --nuraly-button-border-bottom: 1px solid #272626;
              --nuraly-button-background-color: #494949;
              --nuraly-button-text-color: #ffffff;
              --nuraly-button-primary-background-color: #212121;
              --nuraly-button-primary-border-color: #212121;
              --nuraly-button-primary-hover-border-color: #212121;
              --nuraly-button-hover-border-color : #212121;
              --nuraly-button-active-border-color: #212121;
              --nuraly-button-active-background-color: #212121;
              --nuraly-button-primary-hover-border-color: #212121;
              --nuraly-button-primary-hover-background-color: #212121;
              --nuraly-button-hover-background-color: #3b3b3b;
              /* Collapse Styles (Dark Mode) */
              --nr-collapse-border: 1px solid #a8a8a8;
              --nr-collapse-header-hover-background-color: #3a3a3a;
              --nr-collapse-header-collapsed-background-color: #3a3a3a;
              --nuraly-button-hover-color: #ffffff;
              --nuraly-select-options-background-color: #0a0a0a;

          }
         
      }
  `;

  /**
   * State variables
   */
  @state() selectedComponent: ComponentElement | null = null;
  @state() editableTabs = [];
  @state() currentTab = { 
    type: "page" // set it to default value to prevent the hydration issue
   };

  /**
   * Constructor
   */
  constructor() {
    super();
  }

  /**
   * Lifecycle: connectedCallback
   */
  override connectedCallback() {
    super.connectedCallback();
    this.setupSubscriptions();
  }

  /**
   * Set up subscriptions for state management
   */
  setupSubscriptions() {
    // $context.subscribe(() => {
    //   const selectedComponentIds = (getVar("global", "selectedComponents")?.value || []);
    //   $applicationComponents($currentApplication.get()?.uuid).subscribe((components: ComponentElement[]) => {
    //     const selectedComponents = components.filter((component: ComponentElement) =>
    //       selectedComponentIds.includes(component.uuid)
    //     );
    //     this.selectedComponent = selectedComponents.length ? { ...selectedComponents[0] } : null;
    //   });
    // });

    $editorState.subscribe((editorState) => {
      setTimeout(() => {
        this.currentTab = editorState.currentTab;
        this.requestUpdate()
      }, 0);
    });
  }

  /**
   * Render method
   */
  render() {
    return html`
      ${this.currentTab && this.currentTab.type === "page" ? html`
      <micro-app uuid="1" componentToRenderUUID="right_panel_tabs"></micro-app>
      ` : nothing}
      ${this.currentTab && this.currentTab.type === "function" ? html`
      <micro-app uuid="1" componentToRenderUUID="right_panel_function_tabs"></micro-app>
      ` : nothing}
      ${this.currentTab && this.currentTab.type === "files" ? html`
      <micro-app uuid=${filesAppUUID} componentToRenderUUID=${rightMenuUUID}></micro-app>
      ` : nothing}
    `;
  }
}