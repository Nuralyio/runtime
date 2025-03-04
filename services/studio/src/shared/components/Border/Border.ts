import type { ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/slider-input";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";
import { styleMap } from "lit/directives/style-map.js";

// Debounce function
function debounce(func: Function, wait: number) {
  let timeout: number;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

@customElement("attribute-border-value")
export class AttributeBorderValue extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        --box-manager-background-color: transparent;
      }
      hy-slider-input {
        width: 100%;
        margin-left: 14px;
      }
      hy-input {
        --hybrid-input-container-padding-top: 0px;
        --hybrid-input-container-padding-bottom: 0px;
        --hybrid-input-container-padding-left: 0px;
        --hybrid-input-container-padding-right: 0px;
        --hybrid-input-text-align: center;
      }
      hy-icon {
        font-size: 20px;
      }
      .first-row {
        flex: 80%;
        display: flex;
      }
      .second-row {
        flex: 20%;
      }

      hy-input {
    --hybrid-input-container-border-color: transparent;
    --hybrid-input-container-padding-top: 0px;
    --hybrid-input-container-padding-bottom: 0px;
    --hybrid-input-container-padding-left: 0px;
    --hybrid-input-container-padding-right: 0px;
    --hybrid-input-text-align: center;
  }

  .margin-label,
  .padding-label {
    color: #ccc;
    margin-bottom: 14px;
  }

  .container-outside {
    width: 210px;
    background-color: var(--box-manager-background-color, #393939);
    padding: 50px;
    border-radius: 3px;
    padding-top: 5px;
    padding-bottom: 35px;
	margin-right: 10px;
    position: relative;
  }

  .position-input {
    width: 40px;
  }

  .container-outside > .margin-left,
  .container-outside > .margin-right,
  .container-outside > .margin-top,
  .container-outside > .margin-bottom {
    position: absolute;
    color: #ccc;
  }

  .margin-left {
    left: 5px;
    top: 53.5%;
    transform: translateY(-40%);
  }

  .margin-right {
    right: 37px;
    top: 53.5%;
    transform: translateY(-40%);
  }

  .margin-top {
    top: 20px;
    left: 44.5%;
    transform: translateX(-50%);
  }

  .margin-bottom {
    bottom: 10px;
    left: 44.5%;
    transform: translateX(-50%);
  }

  .container {
    height: 65px;
    border: 1px solid #bcbcbc;
    border-radius: 3px;
    padding: 5px;
    position: relative;
    width: 164px;
  }

  .container > .padding-left {
    position: absolute;
    top: 40%;
    left: 4px;
  }

  .container > .padding-right {
    position: absolute;
    top: 40%;
    right: 4px;
  }

  .container > .padding-top {
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
  }

  .container > .padding-bottom {
    position: absolute;
    bottom: 5px;
    left: 50%;
    transform: translateX(-50%);
  }

  .container > .border-bottom-right-radius {
    position: absolute;
    bottom: -28px;
    right: -27px;
  }





  .input-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    margin: 10px;
  }

  @media (prefers-color-scheme: dark) {
    :host{
      --box-manager-background-color: #393939;
    }
  }
  
    `
  ];
  @property()
  component: ComponentElement;
  @state()
  borderRadius = 0;
  @state()
  position: any = {};
  @state()
  margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    unit: "px",
  };

  @state()
cassAttributes : any = {
}

  // Padding States
  @state()
  padding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    unit: "px",
  };
  @state()
  unity = "";
  // Debounced changed event handler
  debouncedChanged = debounce((attributeName:string) => {
    if (this.component.event.borderRadiusChanged) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.borderRadiusChanged`), {
        attributeName,
        value: this.cassAttributes[attributeName],
      });
    }
  }, 100); // Adjust the debounce delay as needed

  override render() {
    const handlers = this.inputHandlersValue.value;
    this.borderRadius = this.inputHandlersValue.value ? this.inputHandlersValue.value["border-radius"]?.value : 0;
    this.unity = this.inputHandlersValue.value ? this.inputHandlersValue.value["border-radius"]?.unit : "px";
       // Initialize Margin
        this.cassAttributes["margin-top"] = `${handlers?.["margin-top"]?.value ?? 0}${handlers?.["margin-top"]?.unit ?? "px"}`;
        this.cassAttributes["margin-right"] = `${handlers?.["margin-right"]?.value ?? 0}${handlers?.["margin-right"]?.unit ?? "px"}`;
        this.cassAttributes["margin-bottom"] = `${handlers?.["margin-bottom"]?.value ?? 0}${handlers?.["margin-bottom"]?.unit ?? "px"}`;
        this.cassAttributes["margin-left"] = `${handlers?.["margin-left"]?.value ?? 0}${handlers?.["margin-left"]?.unit ?? "px"}`;
        this.cassAttributes["padding-top"] = `${handlers?.["padding-top"]?.value ?? 0}${handlers?.["padding-top"]?.unit ?? "px"}`;
        this.cassAttributes["padding-right"] = `${handlers?.["padding-right"]?.value ?? 0}${handlers?.["padding-right"]?.unit ?? "px"}`;
        this.cassAttributes["padding-bottom"] = `${handlers?.["padding-bottom"]?.value ?? 0}${handlers?.["padding-bottom"]?.unit ?? "px"}`;
        this.cassAttributes["padding-left"] = `${handlers?.["padding-left"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;
        this.cassAttributes["border-bottom-right-radius"] = `${handlers?.["border-bottom-right-radius"]?.value ?? 0}${handlers?.["padding-left"]?.unit ?? "px"}`;
        
    const isDisabled = this.inputHandlersValue.state == "disabled" ? true : false;
    return html`
      
      <div class="container-outside">
                <div class="margin-label" style="margin-left: -43px; margin-top: 2px"><hy-label>Margin</hy-label> </div>
                <hy-input 
                .size=${"default"}
                @valueChange="${(e) => {
                  this.cassAttributes["margin-left"] = e.detail.value;
                  this.debouncedChanged("margin-left");
                }}"
                class="position-input margin-left" placeholder="margin left" value=${this.cassAttributes["margin-left"]}></hy-input>
                <hy-input
                .size=${"default"} 
                @valueChange="${(e) => {
                  this.cassAttributes["margin-right"] = e.detail.value;
                  this.debouncedChanged("margin-right");
                  
                }}"
                class="position-input margin-right" placeholder="margin right" .value=${this.cassAttributes["margin-right"]}></hy-input>
                <hy-input
                .size=${"default"} 
                @valueChange="${(e) => {
                  this.cassAttributes["margin-top"] = e.detail.value;
                  this.debouncedChanged("margin-top");
                }}"
                class="position-input margin-top" placeholder="margin top" .value=${this.cassAttributes["margin-top"]}></hy-input>
                <hy-input
                .size=${"default"} 
                @valueChange="${(e) => {}}"

                class="position-input margin-bottom" placeholder="margin bottom" .value=${this.cassAttributes["margin-top"]}></hy-input>
            <div class="container "
            style=${
              styleMap({
                'border-bottom-right-radius' : this.cassAttributes["border-bottom-right-radius"]})
            }
            >
                <div class="padding-label"><hy-label>Padding</hy-label></div>
                <hy-input
                .size=${"default"} 
                @valueChange="${(e) => {
                  this.cassAttributes["padding-left"] = e.detail.value;
                  this.debouncedChanged("padding-left");
                }}"
                class="position-input padding-left" placeholder="padding left" .value=${ this.cassAttributes["padding-left"] }></hy-input>

                <hy-input
                .size=${"default"} 
                @valueChange="${(e) => {
                  this.cassAttributes["padding-right"] = e.detail.value;
                  this.debouncedChanged("padding-right");
                }}"

                class="position-input padding-right" placeholder="padding right" .value=${ this.cassAttributes["padding-right"]}></hy-input>
                <hy-input
                .size=${"default"} 
                @valueChange="${(e) => {
                  this.cassAttributes["padding-top"] = e.detail.value;
                  this.debouncedChanged("padding-top");
                }}"

                class="position-input padding-top" placeholder="padding top" .value=${this.cassAttributes["padding-top"]}></hy-input>
                <hy-input
                .size=${"default"}
                @valueChange="${(e) => {
                  this.cassAttributes["padding-bottom"] = e.detail.value;
                  this.debouncedChanged("padding-bottom");
                }}"
                 class="position-input padding-bottom" placeholder="padding bottom" .value=${this.cassAttributes["padding-bottom"]}></hy-input>



                 <hy-input
                .size=${"default"}
                @valueChange="${(e) => {
                  this.cassAttributes["border-bottom-right-radius"] = e.detail.value;
                  this.debouncedChanged("border-bottom-right-radius");
                }}"
                 class="position-input border-bottom-right-radius" placeholder="padding bottom" .value=${this.cassAttributes["border-bottom-right-radius"]}></hy-input>

            </div>
        </div>
    `;
  }
}
