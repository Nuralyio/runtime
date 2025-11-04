import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { eventDispatcher } from "@shared/utils/change-detection.ts";

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
    executeCodeWithClosure(this.component,
      /* js */`
            const selectedComponent = Utils.first(Vars.selectedComponents);
              updateEvent(selectedComponent, "${eventName}", EventData.value )
       
        `, {
        value: e.detail.value
      });
  };

  createHandleCodeChange = (eventName: string) => {
    
    executeCodeWithClosure(this.component,
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
    executeCodeWithClosure(this.component,
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
        placeholder="Select an option"
        @closed=${() => {
    }}
        .template=${this.renderCodeEditorTemplate(eventName, eventValue)}
      >
        <nr-button

          style=${styleMap(
      {
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
        <nr-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
          Set the value programmatically using Javascript script
        </nr-tooltip>
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
            style=${styleMap({
        "--nuraly-dropdown-padding": "5px",
        "--nuraly-dropdown-border-radius": "5px"
      })}
            @click-item=${(e: CustomEvent) => {
        this.createHandleCodeChange(e.detail.value);
      }}
            .options=${
        allowedEvents.filter(
          event => !this.inputHandlersValue?.events[event.name]
        ).map((event) => {
          return { label: event.label, value: event.name };
        })
      }>
            <nr-button
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
            <nr-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
              add trigger
            </nr-tooltip>
          </nr-dropdown>
          <div>
            ${Object.keys(this.inputHandlersValue?.events).map((eventName) => {
        if (this.inputHandlersValue?.events[eventName] === null) return;

        return html`
                <div class="container">
                  <nr-label>${eventName}</nr-label>
                  <div>
                    <nr-button
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
                      .icon=${["remove"]}
                      class="unit"
                      @click=${() => this.removeHandler(eventName)}
                    >${this.inputHandlersValue?.triggerText ?? ""}
                    </nr-button>
                    <nr-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
                      Remove trigger
                    </nr-tooltip>
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