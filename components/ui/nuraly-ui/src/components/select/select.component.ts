/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {property, state, customElement, query} from 'lit/decorators.js';
import {styles} from './select.style.js';
import {map} from 'lit/directives/map.js';
import '../icon/icon.component.js';
import {IOption, OptionSelectionMode, OptionSize, OptionStatus, OptionType} from './select.types.js';
import {choose} from 'lit/directives/choose.js';
import {EMPTY_STRING, MULTIPLE_OPTIONS_SEPARATOR} from './select.constant.js';

@customElement('hy-select')
export class HySelectComponent extends LitElement {
  static override styles = styles;

  @property()
  options!: IOption[];
  @property()
  defaultSelected: string[] = [];
  @property()
  placeholder = 'Select an option';
  @property({type: Boolean, reflect: true})
  disabled = false;
  @property({reflect: true})
  type = OptionType.Default;
  @property()
  selectionMode = OptionSelectionMode.Single;
  @property({type: Boolean, reflect: true})
  show = false;
  @property({reflect: true})
  status = OptionStatus.Default;
  @property({reflect: true})
  size = OptionSize.Medium;

  @state()
  selected: IOption[] = [];

  @query('.options')
  optionsElement!: HTMLElement;
  @query('.wrapper')
  wrapper!: HTMLElement;

  override connectedCallback(): void {
    super.connectedCallback();
    this.initSelectedOptions();
  }
  override updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if (_changedProperties.has('selected')) {
      this.dispatchChangeEvent();
    }
  }
  private initSelectedOptions() {
    if (this.defaultSelected.length) {
      if (this.selectionMode == OptionSelectionMode.Multiple) {
        this.defaultSelected.forEach((defaultOption) => {
          const option = this.options.find((option) => defaultOption == option.label);
          if (option) {
            this.selected.push(option);
          }
        });
      } else {
        const option = this.options.find((option) => this.defaultSelected[0] == option.label);
        if (option) {
          this.selected = [option];
        }
      }
    }
  }

  private async toggleOptions() {
    this.show = !this.show;
    await this.updateComplete;
    if (this.show) this.calculateOptionsPosition();
    else this.initOptionsPosition();
  }
  private calculateOptionsPosition() {
    const wrapperBorderBottomWidth = +getComputedStyle(this.wrapper).borderBottomWidth.split('px')[0];
    const wrapperBorderTopWidth = +getComputedStyle(this.wrapper).borderTopWidth.split('px')[0];
    const clientRect = this.optionsElement.getBoundingClientRect();
    const availableBottomSpace =
      window.visualViewport!.height -
      clientRect.bottom +
      clientRect.height -
      this.wrapper.getBoundingClientRect().height;
    const availableTopSpace = clientRect.top;
    if (clientRect.height > availableBottomSpace && availableTopSpace > clientRect.height) {
      this.optionsElement.style.top = `${-clientRect.height - wrapperBorderTopWidth}px`;
    } else {
      this.optionsElement.style.top = `calc(100% + ${wrapperBorderBottomWidth}px)`;
    }
  }
  private initOptionsPosition() {
    this.optionsElement.style.removeProperty('top');
  }

  private selectOption(selectOptionEvent: Event, selectedOption: IOption) {
    selectOptionEvent.stopPropagation();
    if (this.selectionMode == OptionSelectionMode.Single) {
      this.selected = this.selected.length && this.selected[0].label == selectedOption.label ? [] : [selectedOption];
      this.toggleOptions();
    } else {
      if (this.selected.includes(selectedOption)) {
        this.selected = this.selected.filter(
          (previousSelectedOption) => previousSelectedOption.label != selectedOption.label
        );
      } else {
        this.selected = [...this.selected, selectedOption];
      }
    }
  }
  private unselectAll(unselectAllEvent: Event) {
    unselectAllEvent.stopPropagation();
    this.selected = [];
  }
  private unselectOne(unselectOneEvent: Event, selectedIndex: number) {
    unselectOneEvent.stopPropagation();
    this.selected = this.selected.filter((_, index) => index != selectedIndex);
  }
  private dispatchChangeEvent() {
    let result = this.selectionMode == OptionSelectionMode.Single?this.selected[0]:this.selected
    this.dispatchEvent(new CustomEvent('changed', {detail: {value: result}, bubbles: true, composed: true}));
  }

  private onBlur() {
    this.show = false;
    this.initOptionsPosition();
  }

  protected override render(): unknown {
    return html`
      <slot name="label"></slot>
      <div class="wrapper" tabindex="0" @click="${!this.disabled ? this.toggleOptions : nothing}" @blur=${this.onBlur}>
        <div class="select">
          <div class="select-trigger">
            ${choose(this.selectionMode, [
              [
                OptionSelectionMode.Single,
                () => html`${this.selected.length ? this.selected[0].label : this.placeholder}`,
              ],
              [
                OptionSelectionMode.Multiple,
                () =>
                  html`${this.selected.length
                    ? map(
                        this.selected,
                        (option, index) =>
                          html`<span class="label">
                              <hy-icon
                                name="remove"
                                id="unselect-one"
                                @click=${(e: Event) => this.unselectOne(e, index)}
                              ></hy-icon
                              >${option.label}</span
                            >${this.selected.length - 1 != index ? MULTIPLE_OPTIONS_SEPARATOR : EMPTY_STRING}`
                      )
                    : this.placeholder}`,
              ],
            ])}
          </div>
          <div class="icons-container">
            ${choose(this.status, [
              [OptionStatus.Default, () => undefined],
              [OptionStatus.Warning, () => html`<hy-icon name="warning" id="warning-icon"></hy-icon>`],
              [OptionStatus.Error, () => html`<hy-icon name="exclamation-circle" id="error-icon"></hy-icon>`],
            ])}
            ${this.selected.length
              ? html`<hy-icon
                  name="remove"
                  id="unselect-multiple"
                  @click=${(e: Event) => this.unselectAll(e)}
                ></hy-icon>`
              : nothing}
            <hy-icon name="angle-down" id="arrow-icon"></hy-icon>
          </div>
          <div class="options">
            ${map(
              this.options,
              (option) =>
                html`<div class="option" @click="${(e: Event) => this.selectOption(e, option)}">
                  ${this.selected.includes(option) ? html`<hy-icon name="check" id="check-icon"></hy-icon>` : nothing}
                  <span class="option-text">${option.label}</span>
                </div>`
            )}
          </div>
        </div>
      </div>
      <slot name="helper-text"></slot>
    `;
  }
}