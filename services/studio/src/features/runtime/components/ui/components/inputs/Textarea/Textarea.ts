import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/textarea
try {
  await import("@nuralyui/textarea");
} catch (error) {
  console.warn('[@nuralyui/textarea] Package not found or failed to load.');
}


@customElement("textarea-block")
export class TextareaBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const textareaStyles = this.component?.style || {};

    // Get properties from inputHandlersValue (evaluated handlers) - prioritize over raw input values
    const value = this.inputHandlersValue?.value ?? '';
    const placeholder = this.inputHandlersValue?.placeholder ?? '';
    const label = this.inputHandlersValue?.label ?? '';
    const helperText = this.inputHandlersValue?.helperText ?? this.inputHandlersValue?.helper ?? '';
    const disabled = this.inputHandlersValue?.disabled ?? (this.inputHandlersValue?.state === 'disabled' || false);
    const readonly = this.inputHandlersValue?.readonly ?? false;
    const required = this.inputHandlersValue?.required ?? false;
    const allowClear = this.inputHandlersValue?.allowClear ?? false;
    const showCount = this.inputHandlersValue?.showCount ?? false;
    const autoResize = this.inputHandlersValue?.autoResize ?? false;

    // Get styling properties
    const size = this.inputHandlersValue?.size ?? 'medium';
    const variant = this.inputHandlersValue?.variant ?? 'underlined';
    const state = this.inputHandlersValue?.state ?? 'default';
    const resize = this.inputHandlersValue?.resize ?? 'vertical';

    // Get numeric properties
    const rows = this.inputHandlersValue?.rows ?? 4;
    const cols = this.inputHandlersValue?.cols;
    const maxLength = this.inputHandlersValue?.maxLength;
    const minHeight = this.inputHandlersValue?.minHeight;
    const maxHeight = this.inputHandlersValue?.maxHeight;

    // Get validation rules and other properties
    const rules = this.inputHandlersValue?.rules ?? [];
    const name = this.inputHandlersValue?.name;
    const autocomplete = this.inputHandlersValue?.autocomplete ?? 'off';
    const validateOnChange = this.inputHandlersValue?.validateOnChange ?? true;
    const validateOnBlur = this.inputHandlersValue?.validateOnBlur ?? true;
    const hasFeedback = this.inputHandlersValue?.hasFeedback ?? false;

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
