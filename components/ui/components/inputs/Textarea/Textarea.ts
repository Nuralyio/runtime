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

    // Get properties from resolvedInputs (evaluated handlers) - prioritize over raw input values
    const value = this.resolvedInputs?.value ?? '';
    const placeholder = this.resolvedInputs?.placeholder ?? '';
    const label = this.resolvedInputs?.label ?? '';
    const helperText = this.resolvedInputs?.helperText ?? this.resolvedInputs?.helper ?? '';
    const disabled = this.resolvedInputs?.disabled ?? (this.resolvedInputs?.state === 'disabled' || false);
    const readonly = this.resolvedInputs?.readonly ?? false;
    const required = this.resolvedInputs?.required ?? false;
    const allowClear = this.resolvedInputs?.allowClear ?? false;
    const showCount = this.resolvedInputs?.showCount ?? false;
    const autoResize = this.resolvedInputs?.autoResize ?? false;

    // Get styling properties
    const size = this.resolvedInputs?.size ?? 'medium';
    const variant = this.resolvedInputs?.variant ?? '';
    const state = this.resolvedInputs?.state ?? 'default';
    const resize = this.resolvedInputs?.resize ?? 'vertical';

    // Get numeric properties
    const rows = this.resolvedInputs?.rows ?? 4;
    const cols = this.resolvedInputs?.cols;
    const maxLength = this.resolvedInputs?.maxLength;
    const minHeight = this.resolvedInputs?.minHeight;
    const maxHeight = this.resolvedInputs?.maxHeight;

    // Get validation rules and other properties
    const rules = this.resolvedInputs?.rules ?? [];
    const name = this.resolvedInputs?.name;
    const autocomplete = this.resolvedInputs?.autocomplete ?? 'off';
    const validateOnChange = this.resolvedInputs?.validateOnChange ?? true;
    const validateOnBlur = this.resolvedInputs?.validateOnBlur ?? true;
    const hasFeedback = this.resolvedInputs?.hasFeedback ?? false;

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
