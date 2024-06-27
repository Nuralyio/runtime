import type { ComponentElement } from '$store/component/interface';
import { $AllcomponentWithChildrens, $applicationComponents, $componentWithChildrens } from '$store/component/sotre';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';

@customElement('tabs-block')
export class TabsBlock extends LitElement {


    @property({ type: Object, reflect: false })
    component: ComponentElement;
    @state()
    editableTabs = [];

    @state()
    components: ComponentElement[] = [];


    constructor() {
        super();

        // this.editableTabs = [
        //     {
        //       label: "Pages",
        //       content: html` <div>
        //     <add-screen-editor></add-screen-editor>
        //   </div>
        //   <screen-list-editor></screen-list-editor>`,
        //     },

        //     {
        //       label: "Data source",
        //       content: html`<data-soucres></data-soucres>`,
        //     },
        //   ];

    }
    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    generateComponent(childrensIds: string[]) {
        const childrens = $applicationComponents(this.component.applicationId).get().filter((component: any) => childrensIds.includes(component.uuid));
        return html`${renderComponent(childrens, null, true)} `
    }


    generateTabs() {
        this.editableTabs = [];

        this.component.input.tabs.forEach((tab) => {
            this.editableTabs.push(
                {
                    label: tab.label.value,
                    content: html`<div>${this.generateComponent(tab.childrends.value)}</div> 
                    `
                })
        }
        );
    }
    override connectedCallback() {
        super.connectedCallback();
        this.generateTabs();
    }

    override updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('component')) {
            this.generateTabs();
        }
    }
    override render() {
        return html`
            <div>
            <hy-tabs
  .activeTab=${0}
        .tabs=${this.editableTabs}
        .editable=${{
                canDeleteTab: false,
                canEditTabTitle: false,
                canAddTab: false,
                canMove: false,
            }}
      ></hy-tabs>
                </div>
                `;
    }
}
