/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, TemplateResult, html} from 'lit';
import {property} from 'lit/decorators.js';
import {styles} from './radio.style.js';
import {RadioButtonType, RadioOption} from './radio.type.js';

export class HySelectComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options: RadioOption[] = [];

  @property({type: String})
  display: RadioButtonType = RadioButtonType.Default;

  @property({type: String})
  defaultValue!: string;

  @property({type: String})
  selectedOption!: string;

  constructor() {
    super();
  }

  protected override render(): unknown {
    return html` ${this.renderRadioOptions(this.options)} `;
  }

  handleChange(event: RadioOption) {
    if (event.handler) {
      event.handler(event.value);
    }
    this.selectedOption = event.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.selectedOption,
        },
      })
    );
  }
  private renderRadioOptions(options: RadioOption[]): TemplateResult<1> {
    switch (this.display) {
      case RadioButtonType.Button:
        return this.renderOptionsWithButtons(options);
      default:
        return this.renderOptionDefault(options);
    }
  }

  renderOptionDefault(options: RadioOption[]) {
    return html` ${options.map(
      (option: RadioOption) => html`
        <label class="radio-label">
          <input
            class="radio-input"
            type="radio"
            name="radioGroup"
            .value="${option.value}"
            @change="${() => this.handleChange(option)}"
            ?checked="${option.value === this.selectedOption || option.value === this.defaultValue}"
          />
          ${option.label}
        </label>
      `
    )}`;
  }

  renderOptionsWithButtons(options: RadioOption[]) {
    return html`<span class="buttons-display"
      >${options.map(
        (option: RadioOption) => html`
          <hy-button
            .type="${option.value === this.selectedOption || option.value === this.defaultValue ? 'primary' : ''}"
            @click="${() => this.handleChange(option)}"
            .icon=${option.button?.icon}
            .type=${option.button?.type}
          >
            ${option.label}</hy-button
          >
        `
      )}</span
    >`;
  }
}

customElements.define('hy-radio-input', HySelectComponent);
