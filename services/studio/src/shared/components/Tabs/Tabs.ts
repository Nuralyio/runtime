import type { ComponentElement } from "$store/component/interface.ts";
import { $applicationComponents } from "$store/component/store.ts";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from "@utils/render-util.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { EMPTY_STRING } from "@utils/constants.ts";

@customElement("tabs-block")
export class TabsBlock extends BaseElementBlock {
  static override styles = css`
      :host {
          display: block;
          height: 100%;
      }
  `;
  @property({ type: Object, reflect: false })
  component: ComponentElement;
  @state()
  private editableTabs = [];
  @state()
  private componentsWithChildren: ComponentElement[] = [];

  override  connectedCallback() {
     super.connectedCallback();
     this.traitInputsHandlers();
  }

  override update(changedProperties: Map<string | number | symbol, unknown>) {
    super.update(changedProperties);
    if (changedProperties.has("component")) {
      this.updateComponents();
      //this.editableTabs = this.memoizedGenerateTabs();
    }
  }

  override render() {
    return html`
      ${this.editableTabs?.length > 0 ? html`
        <hy-tabs
          style=${styleMap({

      ...this.component.style
    })}
          .activeTab=${this.inputHandlersValue.index ?? 0}
          .tabs=${this.editableTabs}
          .editable=${{
      canDeleteTab: false,
      canEditTabTitle: false,
      canAddTab: false,
      canMove: false
    }}
        ></hy-tabs>
      ` : EMPTY_STRING}
    `;
  }

  private generateComponent(childrensIds: string[]) {
    const childrens = this.componentsWithChildren.filter(component => childrensIds?.includes(component.uuid));
    return html`${renderComponent(childrens, null, true)}`;
  }

  private generateTabs() {
    return (this.inputHandlersValue.tabs)?.map(tab => ({
      label: tab.label.value,
      content: html`
        <div>${this.generateComponent(tab.childrends.value)}</div>`
    }));
  }

  private updateComponents() {
    $applicationComponents(this.component.application_id).subscribe((components = []) => {
      this.componentsWithChildren = [...components];
      this.editableTabs = this.generateTabs();
    });
  }
}