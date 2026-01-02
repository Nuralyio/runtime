// collapse-block.ts

import { html, nothing, type PropertyValues } from "lit";
import { BaseElementBlock } from "../../base/BaseElement.ts";

// Safely import @nuralyui/collapse
try {
  await import("@nuralyui/collapse");
} catch (error) {
  console.warn('[@nuralyui/collapse] Package not found or failed to load. Collapse functionality may be limited.');
}

import { customElement, state } from "lit/decorators.js";
import { renderComponent } from '../../../../../utils/render-util';
import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { $applicationComponents } from '../../../../../redux/store/component/store.ts';
import { styleMap } from "lit/directives/style-map.js";

@customElement("collapse-block")
export class Collapse extends BaseElementBlock {
  @state()
  private sections: any[] = [];

  @state()
  private openStates: boolean[] = [];

  @state()
  private componentsWithChildren: ComponentElement[] = [];

  constructor() {
    super();
    this.registerCallback('components', ()=>{
      this.updateComponents();
    });
  }
  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateComponents();
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {


    super.firstUpdated(_changedProperties);
    const application_id = this.component.application_id;
    this.componentsWithChildren = $applicationComponents(application_id).get();
  }

  private updateComponents() {
    this.sections = this.generateSection();
  }

  override render() {
    return html`
      <nr-collapse
        style=${styleMap(this.component.style)}
        .sections=${[...this.sections]}
        .size=${this.resolvedInputs?.size ?? nothing}
        @section-toggled=${this.handleSectionToggled}
      ></nr-collapse>
    `;
  }

  private handleSectionToggled(e: CustomEvent) {
    const index = e.detail.index;
    this.openStates[index] = !this.openStates[index];
    this.sections[index].open = this.openStates[index];
    this.requestUpdate();
  }

  private generateComponent(blockName: string) {
    const children = this.componentsWithChildren.filter(
      (component) => blockName === component.uuid
    );
    // Render directly without memoization
    return renderComponent(children, null, true);
  }

  private generateSection() {
    const components = this.resolvedInputs?.components;
    if (!components || !Array.isArray(components)) {
      return [];
    }
    return components.map(
      (section: { label: any; blockName: string; open: boolean }, index: number) => {
        return {
          header: section.label,
          content: html`<div>${this.generateComponent(section.blockName)}</div>`,
          open: this.openStates[index] ?? section.open,
        };
      }
    );
  }
}