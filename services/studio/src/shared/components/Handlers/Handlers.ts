import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { executeCodeWithClosure } from "../../../core/executer.ts";

@customElement("handler-block")
export class HandlerBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {
      this.requestUpdate();
    });
  }

  handleCodeChange = (e: CustomEvent, eventName: string) => {
    executeCodeWithClosure(this.component,
      `
        try{
          const selectedComponens =  GetVar( "selectedComponents")||[];
          if( selectedComponens.length) {
              const selectedComponent = selectedComponens[0];
              let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
              updateEvent(currentComponent, "${eventName}", EventData.value )
          }
        }catch(error){
            console.log(error);
        }
        `, {
        value: e.detail.value
      });
  };

  createHandleCodeChange = (eventName: string) => {
    executeCodeWithClosure(this.component,
      `
        try{
          const selectedComponens =  GetVar( "selectedComponents")||[];
          if( selectedComponens.length) {
              const selectedComponent = selectedComponens[0];
              let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
              updateEvent(currentComponent, "${eventName}", EventData.value )
          }
        }catch(error){
            console.log(error);
        }
        `, {
        value: ""
      });
  };

  removeHandler = (eventName: string) => {
    executeCodeWithClosure(this.component,
      `
        try{
          const selectedComponens =  GetVar( "selectedComponents")||[];
          if( selectedComponens.length) {
              const selectedComponent = selectedComponens[0];
              let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
              updateEvent(currentComponent, "${eventName}", null )
          }
        }catch(error){
            console.log(error);
        }
        `, {
      });
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

  static styles = [
    css`   
        .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
    `
  ];

  render() {
    const eventsHandlers = this.inputHandlersValue?.events ?? {};
    return html`
      <hy-label style="text-align:center; margin-top : 15px">Click + above to add user trigger actions (such as on hover or click).</hy-label>

      <hy-dropdown
        style=${
          styleMap({
            "--hybrid-dropdown-padding": "5px",
            "--hybrid-dropdown-border-radius":"5px"
          })
        }
        @click-item=${(e: CustomEvent) => {
          this.createHandleCodeChange(e.detail.value)
        }}
      .options=${
        (this.inputHandlersValue.allowedEvents ?? []).filter(
          event=>this.inputHandlersValue?.events[event.name]===undefined || this.inputHandlersValue?.events[event.name] === null
        ).map((event) => {
          return {label: event.label, value: event.name}
        })
      }>
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
                  .icon=${["plus"]}
                  class="unit"
                >${this.inputHandlersValue?.triggerText ?? ""}
                </hy-button>
                <hy-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
                  add trigger
                </hy-tooltip>
      </hy-dropdown>
      <div>
        ${Object.keys(eventsHandlers).map((eventName) => {
          if(this.inputHandlersValue?.events[eventName] === null)
            return 
          
          return html`
            <div class="container">
              <hy-label>${eventName}</hy-label>
              <div>
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
                  .icon=${["remove"]}
                  class="unit"
                  @click=${()=>this.removeHandler(eventName)}
                >${this.inputHandlersValue?.triggerText ?? ""}
                </hy-button>
                <hy-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
                  Remove trigger
                </hy-tooltip>
                ${this.renderEvent(eventName, eventsHandlers[eventName])}

              </div>
            </div>
          `;
        })
        }
      </div>

    `;
  }
}