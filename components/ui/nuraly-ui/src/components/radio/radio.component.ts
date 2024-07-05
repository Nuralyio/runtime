/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './radio.style.js';
import {RadioButtonType, RadioButtonOption, RadioButtonPosition, RadioButtonDirection} from './radio.type.js';
import {choose} from 'lit/directives/choose.js';
import '../button/hy-button.component';
import {classMap} from 'lit/directives/class-map.js';
@customElement('hy-radio-input')
export class HyRadioComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options!: RadioButtonOption[];

  @property({type: String})
  type = RadioButtonType.Default;

  @property({reflect: true})
  position = RadioButtonPosition.Left;

  @property({reflect: true})
  direction = RadioButtonDirection.Vertical;

  @property({type: String})
  defaultValue!: string;

  @state()
  selectedOption!: string;

  isAllDisabled = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.selectedOption = this.defaultValue;
  }

  override willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('options')) {
      const option = this.options.find((option) => option.value == this.defaultValue && option.disabled);
      if (option) {
        this.isAllDisabled = true;
      }
    }
  }

  handleChange(option: RadioButtonOption) {
    this.selectedOption = option.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: this.selectedOption,
        },
      })
    );
  }

  renderOptionDefault() {
    return html` ${this.options.map(
      (option: RadioButtonOption) => html`
        <div
          class="radio-container ${classMap({
            error: option.state == 'error',
            warning: option.state == 'warning',
          })}"
        >
          <label class="radio">
            <div class="input-container">
              <input
                class="radio-input"
                type="radio"
                name="radioGroup"
                .value="${option.value}"
                @change="${() => this.handleChange(option)}"
                ?checked="${option.value === this.selectedOption}"
                ?disabled=${option.disabled || this.isAllDisabled}
              />
            </div>
            <span>${option.label}</span>
          </label>
          ${option.state && option.message
            ? html`<div class="message-container">
                <hy-icon name="${option.state == 'error' ? 'exclamation-circle' : 'warning'}"></hy-icon>
                <span>${option.message}</span>
              </div>`
            : nothing}
        </div>
      `
    )}`;
  }

  renderOptionsWithButtons() {
    return html`<div class="type-button">
      ${this.options.map(
        (option: RadioButtonOption) => html`
          <hy-button
            .icon=${option.icon ? [option.icon] : []}
            .disabled=${option.disabled || this.isAllDisabled}
            .type="${option.value == this.selectedOption || this.isAllDisabled ? 'primary' : ''}"
            @click="${() => option.value != this.selectedOption && this.handleChange(option)}"
          >
            ${option.label}</hy-button
          >
        `
      )}
    </div>`;
  }
  protected override render() {
    return html`${choose(this.type, [
      [RadioButtonType.Default, () => this.renderOptionDefault()],
      [RadioButtonType.Button, () => this.renderOptionsWithButtons()],
    ])} `;
  }
}
