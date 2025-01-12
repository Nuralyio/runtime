import { html, nothing, type PropertyValues } from "lit";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/collapse";
import { customElement, state } from "lit/decorators.js";
import { renderComponent } from "@utils/render-util.ts";
import { memoize } from "@utils/memoize.ts"; // Adjust the path as needed
import type { ComponentElement } from "$store/component/interface.ts";
import { $applicationComponents } from "$store/component/store.ts";
import { styleMap } from "lit/directives/style-map.js";

@customElement("collapse-block")
export class Collapse extends BaseElementBlock {

  @state()
  private sections: any[] = [];

  @state()
  private openStates: boolean[] = [];

  @state()
  private componentsWithChildren: ComponentElement[] = [];

  // Memoized version of renderComponent
  private memoizedRenderComponent = memoize(renderComponent);

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateComponents();
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    const applicationId = this.component.applicationId;
    this.componentsWithChildren = $applicationComponents(applicationId).get();
  }

  private updateComponents() {
    this.sections = this.generateSection();
  }

  override render() {
    return html`
      <hy-collapse
        style=${styleMap(this.component.style)}
        .sections=${this.sections}
        .size=${this.inputHandlersValue?.size ?? nothing}
        @section-toggled=${this.handleSectionToggled}
      ></hy-collapse>
    `;
  }

  private handleSectionToggled(e: CustomEvent) {
    const index = e.detail.index;
    this.openStates[index] = !this.openStates[index];
    this.sections[index].open = this.openStates[index];
    this.requestUpdate();
  }

  private generateComponent(blockName: string) {
    const children = this.componentsWithChildren.filter(component => blockName === component.uuid);
    // Use the memoized renderComponent
    return this.memoizedRenderComponent(children, null, true);
  }

  private generateSection() {
    const components = this.inputHandlersValue.components;
    return components?.map((section: { label: any; blockName: string; open: boolean }, index: number) => {
      return {
        header: section.label,
        content: html`<div>${this.generateComponent(section.blockName)}</div>`,
        open: this.openStates[index] ?? section.open
      };
    });
  }
}