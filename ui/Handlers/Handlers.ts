import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
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

      <hy-dropdown
        placeholder="Select an option"
        @closed=${() => {
    }}
        .template=${this.renderCodeEditorTemplate(eventName, eventValue)}
      >
        <hy-button

          style=${styleMap(
      {
        "--hybrid-button-text-color": "#b8b8b8",
        "--hybrid-button-height": "39px",
        "--hybrid-button-width": this.inputHandlersValue?.triggerText ? "auto" : "30px",
        "--hybrid-button-background-color": "transparent",
        "--hybrid-button-border-left": "none",
        "--hybrid-button-border-right": "none",
        "--hybrid-button-border-top": "none",
        "--hybrid-button-border-bottom": "none"

      })}
          .icon=${["code"]}
          class="unit"
          iconPosition=${!this.inputHandlersValue?.triggerText ? "left" : "right"}
        >${this.inputHandlersValue?.triggerText ?? ""}
        </hy-button>
        <hy-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
          Set the value programmatically using Javascript script
        </hy-tooltip>
      </hy-dropdown>
      
    `;
  }

  renderComponent() {
    const eventsHandlers = {...this.inputHandlersValue?.events ?? {}};
    const allowedEvents = this.inputHandlersValue?.allowedEvents ?? [];

    return html`
    ${allowedEvents.length === 0
      ? html`
        <hy-label style="text-align:center; margin : 15px; color: red;">
          No available events for this type of component.
        </hy-label>`
      : html`
          <hy-label style="text-align:center; margin-top : 15px">
            Click + above to add user trigger actions (such as on hover or click).
          </hy-label>
          
          <hy-dropdown
            style=${styleMap({
        "--hybrid-dropdown-padding": "5px",
        "--hybrid-dropdown-border-radius": "5px"
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
            <hy-button
              style=${styleMap({
        "--hybrid-button-text-color": "#b8b8b8",
        "--hybrid-button-height": "39px",
        "--hybrid-button-width": this.inputHandlersValue?.triggerText ? "auto" : "30px",
        "--hybrid-button-background-color": "transparent",
        "--hybrid-button-border-left": "none",
        "--hybrid-button-border-right": "none",
        "--hybrid-button-border-top": "none",
        "--hybrid-button-border-bottom": "none"
      })}
              .icon=${["plus"]}
              class="unit"
            >${this.inputHandlersValue?.triggerText ?? ""}
            </hy-button>
            <hy-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
              add trigger
            </hy-tooltip>
          </hy-dropdown>
          <div>
            ${Object.keys(this.inputHandlersValue?.events).map((eventName) => {
        if (this.inputHandlersValue?.events[eventName] === null) return;

        return html`
                <div class="container">
                  <hy-label>${eventName}</hy-label>
                  <div>
                    <hy-button
                      style=${styleMap({
          "--hybrid-button-text-color": "#b8b8b8",
          "--hybrid-button-height": "39px",
          "--hybrid-button-width": this.inputHandlersValue?.triggerText ? "auto" : "30px",
          "--hybrid-button-background-color": "transparent",
          "--hybrid-button-border-left": "none",
          "--hybrid-button-border-right": "none",
          "--hybrid-button-border-top": "none",
          "--hybrid-button-border-bottom": "none"
        })}
                      .icon=${["remove"]}
                      class="unit"
                      @click=${() => this.removeHandler(eventName)}
                    >${this.inputHandlersValue?.triggerText ?? ""}
                    </hy-button>
                    <hy-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
                      Remove trigger
                    </hy-tooltip>
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