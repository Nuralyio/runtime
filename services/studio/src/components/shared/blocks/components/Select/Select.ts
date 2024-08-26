import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";
import { $environment, ViewMode } from "$store/environment";


@customElement("select-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  mode: ViewMode;

  constructor(){
    super()
    $environment.subscribe((environment) => {
      this.mode = environment.mode;
      this.requestUpdate();
    })
  }


  handleValueChange = (e) => {
    if (this.component.event.changed) {
      const optionValue = e.detail.value?e.detail.value.value:'';
      executeEventHandler(this.component, "event", "changed", {
        EventData: {
          value: optionValue,
        },
      });
    }
  };

  render() {
    const options = this.inputHandlersValue?.value?.[0] ??  [];
    const defaultSelected = this.inputHandlersValue?.value?.[1]??[];
    const selectStyles = this.component.style
    return html`
        <hy-select style=${styleMap({ ...selectStyles })}
        selectionMode=${this.inputHandlersValue?.selectionMode === 'multiple' ? 'multiple' : nothing}
        .options=${options}
        .defaultSelected="${defaultSelected}"
        .placeholder=${this.inputHandlersValue.placeholder||'Select an option'}
        .status=${selectStyles.state ?? nothing}
        .size=${selectStyles.size ??nothing}
        .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
        .type=${this.inputHandlersValue.type=='inline'?'inline':nothing}
        @changed=${this.handleValueChange}
      >
        <span slot="label">${this.inputHandlersValue.label??nothing}</span>
        <span slot="helper-text">${this.inputHandlersValue.helper??nothing}</span>
      </hy-select>
    `;
  }
}