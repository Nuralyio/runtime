import type { ComponentElement } from '$store/component/interface';
import { $applicationComponents } from '$store/component/component-sotre';
import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';
import { BaseElementBlock } from '../BaseElement';
import { eventDispatcher } from 'utils/change-detection';
import { styleMap } from 'lit/directives/style-map.js';

@customElement('tabs-block')
export class TabsBlock extends BaseElementBlock {
    @property({ type: Object, reflect: false })
    component: ComponentElement;

    @state()
    private editableTabs = [];

    @state()
    private componentsWithChildrens: ComponentElement[] = [];

    static override styles = css`
    :host {
      display: block;
      height: 100%;
    }
  `;
    tabsValueRecived(tabs: any) {
        this.updateComponents();
    }

    constructor() {
        super();
        this.registerCallback('tabs', this.tabsValueRecived.bind(this));
       
    }
    
    private generateComponent(childrensIds: string[]) {
        const childrens = this.componentsWithChildrens.filter(component => childrensIds?.includes(component.uuid));
        return html`${renderComponent(childrens, null, true)}`;
    }

    private generateTabs() {
        return (this.inputHandlersValue.tabs)?.map(tab => ({
            label: tab.label.value,
            content: html`<div>${this.generateComponent(tab.childrends.value)}</div>`
        }));
    }

    override connectedCallback() {
        super.connectedCallback();
        eventDispatcher.on('component:refresh', () => {
            this.updateComponents();
        })
        this.traitInputsHandlers();
    }

    private updateComponents() {
        $applicationComponents(this.component.applicationId).subscribe((components = []) => {
            this.componentsWithChildrens = components;
            this.editableTabs = this.generateTabs();
        });
        this.requestUpdate();
    }

    override updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('component')) {
            this.traitInputsHandlers();
            //this.editableTabs = this.memoizedGenerateTabs();
        }
    }

    override render() {
        return html`
        ${this.editableTabs?.length > 0 ? html`
          <hy-tabs
          style=${styleMap({

            ...this.component.style,
        })}
            .activeTab=${0}
            .tabs=${this.editableTabs}
            .editable=${{
                    canDeleteTab: false,
                    canEditTabTitle: false,
                    canAddTab: false,
                    canMove: false,
                }}
          ></hy-tabs>
        ` : ''}
    `;
    }
}