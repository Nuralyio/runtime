import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/textarea";
import { ref } from "lit/directives/ref.js";

@customElement("textarea-block")
export class TextareaBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const textareaStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const value = this.component?.input?.value?.value || this.inputHandlersValue?.value || '';
    const placeholder = this.component?.input?.placeholder?.value || this.inputHandlersValue?.placeholder || '';
    const label = this.component?.input?.label?.value || this.inputHandlersValue?.label || '';
    const helperText = this.component?.input?.helperText?.value || this.inputHandlersValue?.helperText || '';
    const disabled = this.component?.input?.disabled?.value ?? this.inputHandlersValue?.disabled ?? false;
    const readonly = this.component?.input?.readonly?.value ?? this.inputHandlersValue?.readonly ?? false;
    const required = this.component?.input?.required?.value ?? this.inputHandlersValue?.required ?? false;
    const allowClear = this.component?.input?.allowClear?.value ?? this.inputHandlersValue?.allowClear ?? false;
    const showCount = this.component?.input?.showCount?.value ?? this.inputHandlersValue?.showCount ?? false;
    const autoResize = this.component?.input?.autoResize?.value ?? this.inputHandlersValue?.autoResize ?? false;
    
    // Get styling properties
    const size = this.component?.input?.size?.value || this.inputHandlersValue?.size || 'medium';
    const variant = this.component?.input?.variant?.value || this.inputHandlersValue?.variant || 'underlined';
    const state = this.component?.input?.state?.value || this.inputHandlersValue?.state || 'default';
    const resize = this.component?.input?.resize?.value || this.inputHandlersValue?.resize || 'vertical';
    
    // Get numeric properties
    const rows = this.component?.input?.rows?.value || this.inputHandlersValue?.rows || 4;
    const cols = this.component?.input?.cols?.value || this.inputHandlersValue?.cols;
    const maxLength = this.component?.input?.maxLength?.value || this.inputHandlersValue?.maxLength;
    const minHeight = this.component?.input?.minHeight?.value || this.inputHandlersValue?.minHeight;
    const maxHeight = this.component?.input?.maxHeight?.value || this.inputHandlersValue?.maxHeight;
    
    // Get validation rules and other properties
    const rules = this.inputHandlersValue?.rules || [];
    const name = this.component?.input?.name?.value || this.inputHandlersValue?.name;
    const autocomplete = this.component?.input?.autocomplete?.value || this.inputHandlersValue?.autocomplete || 'off';
    const validateOnChange = this.component?.input?.validateOnChange?.value ?? this.inputHandlersValue?.validateOnChange ?? true;
    const validateOnBlur = this.component?.input?.validateOnBlur?.value ?? this.inputHandlersValue?.validateOnBlur ?? true;
    const hasFeedback = this.component?.input?.hasFeedback?.value ?? this.inputHandlersValue?.hasFeedback ?? false;

    return html`
      <nr-textarea
        ${ref(this.inputRef)}
        style=${styleMap(textareaStyles)}
        .value=${value}
        .placeholder=${placeholder}
        .label=${label}
        .helperText=${helperText}
        .size=${size}
        .variant=${variant}
        .state=${state}
        .resize=${resize}
        .rows=${rows}
        .cols=${cols}
        .maxLength=${maxLength}
        .minHeight=${minHeight}
        .maxHeight=${maxHeight}
        .rules=${rules}
        .name=${name}
        .autocomplete=${autocomplete}
        ?disabled=${disabled}
        ?readonly=${readonly}
        ?required=${required}
        ?allowClear=${allowClear}
        ?showCount=${showCount}
        ?autoResize=${autoResize}
        ?validateOnChange=${validateOnChange}
        ?validateOnBlur=${validateOnBlur}
        ?hasFeedback=${hasFeedback}
        @nr-textarea-change=${(e: CustomEvent) => {
          this.executeEvent('onChange', e, {
            value: e.detail.value,
            characterCount: e.detail.characterCount
          });
        }}
        @nr-focus=${(e: CustomEvent) => {
          this.executeEvent('onFocus', e);
        }}
        @nr-blur=${(e: CustomEvent) => {
          this.executeEvent('onBlur', e, {
            value: e.detail.value
          });
        }}
        @nr-clear=${(e: CustomEvent) => {
          this.executeEvent('onClear', e);
        }}
        @nr-resize=${(e: CustomEvent) => {
          this.executeEvent('onResize', e, {
            height: e.detail.height,
            width: e.detail.width
          });
        }}
      ></nr-textarea>
    `;
  }
}
