import { LitElement, css, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import { $applicationComponents } from "$store/component/store.ts";
import { type ComponentElement } from "$store/component/interface.ts";
import { $currentApplication } from "$store/apps.ts";
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
          --hybrid-input-focus-border: 1px solid gray;
          --hybrid-input-number-icons-container-width: 48px;
          --hybrid-input-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
          --hybrid-input-small-padding-top: 0px;
          --hybrid-input-border-bottom: none;
          --hybrid-input-font-size: 11px;

          /* Select Styles */
          --hybrid-select-small-height: 28px;
          --hybrid-select-icon-width: 11px;
          --hybrid-select-border-bottom: 1px solid #a8a8a8;
          --hybrid-select-border-top: 1px solid #a8a8a8;
          --hybrid-select-border-left: 1px solid #a8a8a8;
          --hybrid-select-border-right: 1px solid #a8a8a8;
          --hybrid-select-border-radius: 7px;
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
              --hybrid-input-focus-border: 1px solid #ffffff;

              /* Select Styles (Dark Mode) */
              --hybrid-select-focus-border: 1px solid #ffffff;

              /* Button Styles (Dark Mode) */
              --hybrid-button-border-left: 1px solid #a8a8a8;
              --hybrid-button-border-right: 1px solid #a8a8a8;
              --hybrid-button-border-top: 1px solid #a8a8a8;
              --hybrid-button-border-bottom: 1px solid #a8a8a8;
              --hybrid-button-background-color: #000000;
              --hybrid-button-text-color: #ffffff;

              /* Collapse Styles (Dark Mode) */
              --hy-collapse-border: 1px solid #a8a8a8;
              --hy-collapse-header-hover-background-color: #3a3a3a;
              --hy-collapse-header-collapsed-background-color: #3a3a3a;
          }
      }
  `;

  /**
   * State variables
   */
  @state() selectedComponent: ComponentElement | null = null;
  @state() editableTabs = [];

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
      $applicationComponents($currentApplication.get().uuid).subscribe((components: ComponentElement[]) => {
        const selectedComponents = components.filter((component: ComponentElement) =>
          selectedComponentIds.includes(component.uuid)
        );
        this.selectedComponent = selectedComponents.length ? { ...selectedComponents[0] } : null;
      });
    });
  }

  /**
   * Render method
   */
  render() {
    return html`
      <micro-app uuid="1" componentToRenderUUID="right_panel_tabs"></micro-app>
    `;
  }
}