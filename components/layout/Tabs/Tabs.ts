import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { $applicationComponents } from "@shared/redux/store/component/store.ts";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from "@shared/utils/render-util.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { EMPTY_STRING } from "@shared/utils/constants.ts";

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

  constructor() {
    super()
    this.registerCallback('tabs', () => {
      this.updateComponents();
      this.editableTabs = this.generateTabs();
    })
  }
  override async update(changedProperties: Map<string | number | symbol, unknown>) {
    super.update(changedProperties);
    if (changedProperties.has("component")) {
      this.updateComponents();
      this.editableTabs = this.generateTabs();
    }
  }

  override render() {
    return html`
      ${this.editableTabs?.length > 0 ? html`
        <nr-tabs
          style=${styleMap({

      ...this.component.style
    })}
          .activeTab=${this.inputHandlersValue.index ?? 0}
          .tabs=${this.editableTabs}
          size=${this.inputHandlersValue?.size ?? 'medium'}
          @tabTilteClick=${(e: CustomEvent) => {
            //@todo pass the object
          this.executeEvent('onTabChanged', e, {
            tab: this.editableTabs.find((tab, index) => index === e.detail.index),
          });
        }}
          .editable=${{
          canDeleteTab: false,
          canEditTabTitle: false,
          canAddTab: false,
          canMove: false
        }}
        ></nr-tabs>
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
      key: tab.key,
      content: html`
        <div>${this.generateComponent(tab.childrends.value)}</div>`
    }));
  }

  private updateComponents() {
    const components = $applicationComponents(this.component.application_id).get();
    this.componentsWithChildren = [...components];
    this.editableTabs = this.generateTabs();
  }
}