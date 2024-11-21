import { html, nothing } from 'lit';
import { BaseElementBlock } from './../BaseElement';
import '@nuraly/collapse'
import { customElement, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';
import type { ComponentElement } from '$store/component/interface';
import { $applicationComponents } from '$store/component/component-sotre';
import { eventDispatcher } from 'utils/change-detection';
import { styleMap } from 'lit/directives/style-map.js';


@customElement("collapse-block")
export class Collapse extends BaseElementBlock{
 
    @state()
    sections=[]

    componentsWithChildrens : ComponentElement[] = [];
 
    override updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('component')) {
            this.updateComponents();
        }
    }
     updateComponents(){
        $applicationComponents(this.component.applicationId).subscribe((components = []) => {
            this.componentsWithChildrens = components;
            this.sections=this.generateSection();  
        });
    }
    private generateComponent(children: string) {
        const childrens = this.componentsWithChildrens.filter(component => children == component.uuid);
        return html`${renderComponent(childrens, null, true)}`;
    }

    private generateSection() {
        return (this.inputHandlersValue.components)?.map(section =>{
           return {
            header: section.label,
            content: html`<div>${this.generateComponent(section.blockName)}</div>`
          }
        }
            
    
    );
    }


   override render(){

    return html`
    <hy-collapse
    style=${styleMap({ ...this.component.style })}
    .sections=${this.sections ?? nothing}
    .size=${this.inputHandlersValue?.size ?? nothing}
    >
    </hy-collapse>
    
    `

   }
 

}