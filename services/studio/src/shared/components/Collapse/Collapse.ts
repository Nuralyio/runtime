import { html, nothing } from "lit";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/collapse";
import { customElement, state } from "lit/decorators.js";
import { renderComponent } from "../../../utils/render-util.ts";
import type { ComponentElement } from "$store/component/interface.ts";
import { $applicationComponents } from "$store/component/store.ts";
import { styleMap } from "lit/directives/style-map.js";


@customElement("collapse-block")
export class Collapse extends BaseElementBlock {

  @state()
  sections = [];
  @state()
  componentsWithChildren: ComponentElement[] = [];

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      this.updateComponents();
    }
  }

  updateComponents() {
    $applicationComponents(this.component.applicationId).subscribe((components = []) => {
      this.componentsWithChildren = [...components];
      this.sections = this.generateSection();
    });
  }

  private generateComponent(_children: string) {
    const children = this.componentsWithChildren.filter(component => _children == component.uuid);
    return html`${renderComponent(children, null, true)}`;
  }

  private generateSection() {
    return (this.inputHandlersValue.components)?.map((section: { label: any; blockName: string; }) => {
        return {
          header: section.label,
          content: html`
            <div>${this.generateComponent(section.blockName)}</div>`
        };
      }
    );
  }


  override render() {

    return html`
      <hy-collapse
        style=${styleMap({ ...this.component.style })}
        .sections=${this.sections ?? nothing}
        .size=${this.inputHandlersValue?.size ?? nothing}
      >
      </hy-collapse>
    `;
  }


}