/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, TemplateResult, html} from 'lit';
import {property, state} from 'lit/decorators.js';
import {styles} from './radio.style';
import '../button/hy-button.component';
import {RadioButtonType, RadioOption} from './radio.type';

export class HySelectComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options: RadioOption[] = [];

  @property({type: String})
  display: RadioButtonType = RadioButtonType.Default;

  @state()
  selectedOption!: string;

  constructor() {
    super();
  }

  protected override render(): unknown {
    return html` ${this.renderRadioOptions(this.options)} `;
  }

  handleChange(event: RadioOption) {
    this.selectedOption = event.value;
    console.log(event);
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          selectedOption: this.selectedOption,
        },
      })
    );
  }
  private renderRadioOptions(options: RadioOption[]): TemplateResult<1> {
    console.log(this.display);
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
            ?checked="${option.value === this.selectedOption}"
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
            type="${option.value === this.selectedOption ? 'primary' : ''}"
            @click="${() => this.handleChange(option)}"
          >
            ${option.label}</hy-button
          >
        `
      )}</span
    >`;
  }
}

customElements.define('hy-radio-input', HySelectComponent);
