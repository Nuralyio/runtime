import { css, html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { $applicationComponents } from "$store/component/store.ts";
import { type ComponentElement } from "$store/component/interface.ts";
import { $currentApplication, $editorState } from "$store/apps.ts";
import { $context, getVar } from "$store/context.ts";

/**
 * Control Panel Component
 */
@customElement("control-panel")
export class ParametersPanel extends LitElement {
  /**
   * Styles for the component
   */
  static styles = css`
      /* ===============================
         Micro-App Styles
         =============================== */

      micro-app {
          /* Input Styles */
          --hybrid-input-border-radius: 5px;
          /* --hybrid-input-border-bottom: 1px solid #a8a8a8;
          --hybrid-input-border-top: 1px solid #a8a8a8;
          --hybrid-input-border-left: 1px solid #a8a8a8;
          --hybrid-input-border-right: 1px solid #a8a8a8;*/
          --hybrid-input-border-bottom: 2px solid transparent;
          --hybrid-input-number-icons-container-width: 48px;
          --hybrid-input-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
          --hybrid-input-font-size: 12px;

          /* Select Styles */
          --hybrid-select-icon-width: 11px;
          --hybrid-select-border-bottom: 1px solid #a8a8a8;
          --hybrid-select-border-top: 1px solid #a8a8a8;
          --hybrid-select-border-left: 1px solid #a8a8a8;
          --hybrid-select-border-right: 1px solid #a8a8a8;
          --hybrid-select-border-radius: 5px;
          --hybrid-select-focus-border: 1px solid gray;

          /* Button Styles */
          --hybrid-button-background-color: rgb(245, 245, 245);;
          --hybrid-button-text-color: #535353;
          --hybrid-button-border-left: 1px solid #a8a8a8;
          --hybrid-button-border-right: 1px solid #a8a8a8;
          --hybrid-button-border-top: 1px solid #a8a8a8;
          --hybrid-button-border-bottom: 1px solid #a8a8a8;

          /* Collapse Styles */
          --hy-collapse-content-background-color: transparent;
      }

      /* ===============================
         Dark Mode Styles
         =============================== */
      @media (prefers-color-scheme: dark) {
          micro-app {
              /* Input Styles (Dark Mode) */

              /* Select Styles (Dark Mode) */
              --hybrid-input-border-bottom: 1px solid transparent;
              --hybrid-input-border-top: 1px solid transparent;
              --hybrid-input-border-left: 1px solid transparent;
              --hybrid-input-border-right: 1px solid transparent;
              --hybrid-input-focus-border: 1px solid #a8a8a8;

              --hybrid-select-focus-border: 1px solid #ffffff;

              /* Button Styles (Dark Mode) */
              --hybrid-button-border-left: 1px solid #a8a8a8;
              --hybrid-button-border-right: 1px solid #a8a8a8;
              --hybrid-button-border-top: 1px solid #a8a8a8;
              --hybrid-button-border-bottom: 1px solid #a8a8a8;
              --hybrid-button-background-color: #212121;
              --hybrid-button-text-color: #ffffff;
              --hybrid-button-primary-background-color: #6d6c6c;
              --hybrid-button-primary-border-color: #a8a8a8;
              --hybrid-button-primary-hover-border-color: #a8a8a8;
              --hybrid-button-primary-hover-background-color: #494949;
              /* Collapse Styles (Dark Mode) */
              --hy-collapse-border: 1px solid #a8a8a8;
              --hy-collapse-header-hover-background-color: #3a3a3a;
              --hy-collapse-header-collapsed-background-color: #3a3a3a;

              --hybrid-select-options-background-color: #0a0a0a;

          }
         
      }
  `;

  /**
   * State variables
   */
  @state() selectedComponent: ComponentElement | null = null;
  @state() editableTabs = [];
  @state() currentTab = {  };

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
    $context.subscribe(() => {
      const selectedComponentIds = (getVar("global", "selectedComponents")?.value || []);
      $applicationComponents($currentApplication.get()?.uuid).subscribe((components: ComponentElement[]) => {
        const selectedComponents = components.filter((component: ComponentElement) =>
          selectedComponentIds.includes(component.uuid)
        );
        this.selectedComponent = selectedComponents.length ? { ...selectedComponents[0] } : null;
      });
    });

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
      ${this.currentTab.type}
      ${this.currentTab && this.currentTab.type === "page" ? html`
      <micro-app uuid="1" componentToRenderUUID="right_panel_tabs"></micro-app>
      ` : nothing}
      ${this.currentTab && this.currentTab.type === "function" ? html`
      <micro-app uuid="1" componentToRenderUUID="right_panel_function_tabs"></micro-app>
      ` : nothing}
    `;
  }
}