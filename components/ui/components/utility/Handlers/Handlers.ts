import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { eventDispatcher } from '../../../../../utils/change-detection.ts';

@customElement("handler-block")
export class HandlerBlock extends BaseElementBlock {
  static styles = [
    css`   
        .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    `
  ];
  @property({ type: Object })
  component: ComponentElement;
constructor() {
  super();

  eventDispatcher.onAny( ()=>{
   this.traitInputsHandlers()
  } );
 
}


  handleCodeChange = (e: CustomEvent, eventName: string) => {
    executeHandler(this.component,
      /* js */`
            const selectedComponent = Utils.first(Vars.selectedComponents);
              updateEvent(selectedComponent, "${eventName}", EventData.value )
       
        `, {
        value: e.detail.value
      });
  };

  createHandleCodeChange = (eventName: string) => {
    
    executeHandler(this.component,
      /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
              updateEvent(selectedComponent, "${eventName}", "" )
        `, {
        value: ""
      });
        this.traitInputsHandlers();
        this.requestUpdate( )
  };

  removeHandler = (eventName: string) => {
    executeHandler(this.component,
      /* js */ `
        try{
          const selectedComponent = Utils.first(Vars.selectedComponents);
              updateEvent(selectedComponent, "${eventName}", null )
        }catch(error){
            console.log(error);
        }
        `, {});
  };

  renderCodeEditorTemplate(eventName, eventValue) {
    return html`
      <smart-attribute-handler
        .component=${{ ...this.component }}
        .attributeName=${this.inputHandlersValue.value ? this.inputHandlersValue.value[0] : nothing}
        .attributeValue=${eventValue}
        .attributeScope=${"event"}
        .handlerScope=${"event"}
        @code-change=${(e) => this.handleCodeChange(e, eventName)}
      ></smart-attribute-handler>`;
  }

  renderEvent(eventName, eventValue) {
    return html`
      <nr-dropdown
        placement="bottom-start"
        trigger="click">
        <nr-button
          slot="trigger"
          style=${styleMap({
        "--nuraly-button-text-color": "#b8b8b8",
        "--nuraly-button-height": "39px",
        "--nuraly-button-width": this.inputHandlersValue?.triggerText ? "auto" : "30px",
        "--nuraly-button-background-color": "transparent",
        "--nuraly-button-border-left": "none",
        "--nuraly-button-border-right": "none",
        "--nuraly-button-border-top": "none",
        "--nuraly-button-border-bottom": "none"
      })}
          .icon=${["code"]}
          class="unit"
          iconPosition=${!this.inputHandlersValue?.triggerText ? "left" : "right"}
        >${this.inputHandlersValue?.triggerText ?? ""}
        </nr-button>
        <div slot="content" style="padding: 12px; min-width: 400px;">
          ${this.renderCodeEditorTemplate(eventName, eventValue)}
        </div>
      </nr-dropdown>
    `;
  }

  renderComponent() {
    const eventsHandlers = {...this.inputHandlersValue?.events ?? {}};
    const allowedEvents = this.inputHandlersValue?.allowedEvents ?? [];

    return html`
    ${allowedEvents.length === 0
      ? html`
        <nr-label style="text-align:center; margin : 15px; color: red;">
          No available events for this type of component.
        </nr-label>`
      : html`
          <nr-label style="text-align:center; margin-top : 15px">
            Click + above to add user trigger actions (such as on hover or click).
          </nr-label>
          
          <nr-dropdown
            placement="bottom-start"
            trigger="click">
            <nr-button
              slot="trigger"
              style=${styleMap({
        "--nuraly-button-text-color": "#b8b8b8",
        "--nuraly-button-height": "39px",
        "--nuraly-button-width": this.inputHandlersValue?.triggerText ? "auto" : "30px",
        "--nuraly-button-background-color": "transparent",
        "--nuraly-button-border-left": "none",
        "--nuraly-button-border-right": "none",
        "--nuraly-button-border-top": "none",
        "--nuraly-button-border-bottom": "none"
      })}
              .icon=${["plus"]}
              class="unit"
            >${this.inputHandlersValue?.triggerText ?? ""}
            </nr-button>
            <div slot="content">
              ${allowedEvents.filter(
          event => !this.inputHandlersValue?.events[event.name]
        ).map((event) => {
          return html`
            <button 
              style="display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; border: none; background: none; cursor: pointer; font-size: 14px;"
              @click=${(e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          this.createHandleCodeChange(event.name);
          const dropdown = this.renderRoot.querySelector('nr-dropdown');
          if(dropdown) (dropdown as any).open = false;
        }}>
              <span>${event.label}</span>
            </button>
          `;
        })}
            </div>
          </nr-dropdown>
          <div>
            ${Object.keys(this.inputHandlersValue?.events).map((eventName) => {
        if (this.inputHandlersValue?.events[eventName] === null) return;

        return html`
                <div class="container">
                  <nr-label>${eventName}</nr-label>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <nr-button
                      style=${styleMap({
          "--nuraly-button-text-color": "#b8b8b8",
          "--nuraly-button-height": "39px",
          "--nuraly-button-width": "30px",
          "--nuraly-button-background-color": "transparent",
          "--nuraly-button-border-left": "none",
          "--nuraly-button-border-right": "none",
          "--nuraly-button-border-top": "none",
          "--nuraly-button-border-bottom": "none"
        })}
                      .icon=${["trash"]}
                      class="unit"
                      @click=${() => {
          this.removeHandler(eventName);
          this.requestUpdate();
        }}
                      title="Delete this trigger"
                    ></nr-button>
                    ${this.renderEvent(eventName, eventsHandlers[eventName])}
                  </div>
                </div>
              `;
      })}
          </div>
        `}
  `;
  }
}