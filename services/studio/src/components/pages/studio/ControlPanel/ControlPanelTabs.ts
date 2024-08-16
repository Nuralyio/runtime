import { LitElement, css, html } from "lit";
import { state, customElement } from "lit/decorators.js";
import { $applicationComponents }
  from "$store/component/component-sotre";
import { type ComponentElement } from "$store/component/interface";
import { $currentApplication } from "$store/apps";
import { $context, getVar } from "$store/context";

@customElement("control-panel")
export class ParametersPanel extends LitElement {
  static styles = css``;

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
      <div style="color:white">
      <micro-app uuid="1" componentToRenderUUID="right_panel_tabs"></micro-app>
      </div>
    `;
  }
}