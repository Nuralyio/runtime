/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html, nothing } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { styles } from './input.style.js';
import { INPUT_TYPE, INPUT_STATE, INPUT_SIZE, EMPTY_STRING } from './input.constant.js';
import { choose } from 'lit/directives/choose.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import '../icon/icon.component.js';

@customElement('nr-input')
export class NrInputElement extends NuralyUIBaseMixin(LitElement) {

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: String, reflect: true})
  state = INPUT_STATE.Default;

  @property({type: String})
  value = EMPTY_STRING;

  @property({type: String})
  size = INPUT_SIZE.Medium;

  @property({reflect: true})
  type = INPUT_TYPE.TEXT;

  @property({type: String})
  step?: string;

  @property({type: String})
  min?: string;

  @property({type: String})
  max?: string;

  @property({type: String})
  placeholder = EMPTY_STRING;

  @property({type: String})
  autocomplete = 'off';

  @property({type: Boolean, reflect: true})
  withCopy = false;

  @state()
  inputType = EMPTY_STRING;

  @query('#input')
  input!: HTMLInputElement;

  /**
   * Required components that must be registered for this component to work properly
   */
  override requiredComponents = ['hy-icon'];

  /**
   * Check for required dependencies when component is connected to DOM
   */
  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
  }

  override willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('type')) {
      this.inputType = this.type;
      if (this.inputType === INPUT_TYPE.NUMBER && this.min && !this.value) {
        this.value = this.min;
      }
    }
  }

  override updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('step') || _changedProperties.has('min') || _changedProperties.has('max')) {
      const input = this.input;
      if (input) {
        if (this.step) input.setAttribute('step', this.step);
        else input.removeAttribute('step');
        
        if (this.min) input.setAttribute('min', this.min);
        else input.removeAttribute('min');
        
        if (this.max) input.setAttribute('max', this.max);
        else input.removeAttribute('max');
      }
    }
  }

  private _increment() {
    this.input.stepUp();
    this.value = this.input.value; // Sync the property
    this.dispatchEvent(
      new CustomEvent('nr-input', {
        detail: { 
          value: this.value, 
          target: this.input,
          action: 'increment'
        },
        bubbles: true
      })
    );
  }
  private _decrement() {
    this.input.stepDown();
    this.value = this.input.value; // Sync the property
    this.dispatchEvent(
      new CustomEvent('nr-input', {
        detail: { 
          value: this.value, 
          target: this.input,
          action: 'decrement'
        },
        bubbles: true
      })
    );
  }

  private _valueChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    
    this.dispatchEvent(
      new CustomEvent('nr-input', {
        detail: { 
          value: this.value, 
          target: target,
          originalEvent: e 
        },
        bubbles: true
      })
    );
  }
  private handleKeyDown(keyDownEvent: KeyboardEvent) {
    if (keyDownEvent.key === 'Enter') {
      this.dispatchEvent(
        new CustomEvent('nr-enter', {
          detail: {
            target: keyDownEvent.target,
            value: this.value,
            originalEvent: keyDownEvent
          },
          bubbles: true
        })
      );
    }
  }

  private _handleIconKeydown(keyDownEvent: KeyboardEvent) {
    if (keyDownEvent.key === 'Enter' || keyDownEvent.key === ' ') {
      keyDownEvent.preventDefault();
      const target = keyDownEvent.target as HTMLElement;
      
      if (target.id === 'copy-icon') {
        this.onCopy();
      } else if (target.id === 'password-icon') {
        this._togglePasswordIcon();
      } else if (target.closest('#number-icons')) {
        if (target.getAttribute('name') === 'plus') {
          this._increment();
        } else if (target.getAttribute('name') === 'minus') {
          this._decrement();
        }
      }
    }
  }
  private async onCopy() {
    try {
      const input = this.shadowRoot!.getElementById('input')! as HTMLInputElement;
      input.select();
      await navigator.clipboard.writeText(input.value);
      
      this.dispatchEvent(new CustomEvent('nr-copy-success', {
        detail: { value: input.value },
        bubbles: true
      }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('nr-copy-error', {
        detail: { error },
        bubbles: true
      }));
    }
  }

  private _getAriaDescribedBy(): string {
    const describedBy: string[] = [];
    
    // Check if helper text slot has content
    const helperSlot = this.shadowRoot?.querySelector('slot[name="helper-text"]');
    if (helperSlot && (helperSlot as HTMLSlotElement).assignedNodes().length > 0) {
      describedBy.push('helper-text');
    }
    
    return describedBy.join(' ') || '';
  }

  private _focusEvent(e: Event) {
    this.dispatchEvent(
      new CustomEvent('nr-focus', {
        detail: {
          target: e.target,
          value: this.value
        },
        bubbles: true
      })
    );
  }

  _togglePasswordIcon() {
    if (this.inputType === INPUT_TYPE.PASSWORD) {
      this.inputType = INPUT_TYPE.TEXT;
    } else if (this.inputType === INPUT_TYPE.TEXT && this.type === INPUT_TYPE.PASSWORD) {
      this.inputType = INPUT_TYPE.PASSWORD;
    }
  }

  override render() {
    return html`
      <slot name="label"></slot>
      <div data-size=${this.size} id="input-container">
        <input
          id="input"
          .disabled=${this.disabled}
          .value=${this.value}
          .placeholder=${this.placeholder}
          .type="${this.inputType}"
          .autocomplete=${this.autocomplete}
          aria-invalid=${this.state === INPUT_STATE.Error ? 'true' : 'false'}
          aria-describedby=${this._getAriaDescribedBy()}
          @input=${this._valueChange}
          @focus=${this._focusEvent}
          @keydown=${this.handleKeyDown}
        />
        ${this.withCopy
          ? html`<hy-icon
            name="copy"
            type="regular"
            id="copy-icon"
            role="button"
            aria-label="Copy input value"
            tabindex="0"
            @click=${!this.disabled ? this.onCopy : nothing}
            @keydown=${this._handleIconKeydown}
          ></hy-icon>`
          : nothing}
        ${choose(this.state, [
          [INPUT_STATE.Default, () => undefined],
          [INPUT_STATE.Warning, () => html`<hy-icon name="warning" id="warning-icon"></hy-icon>`],
          [INPUT_STATE.Error, () => html`<hy-icon name="exclamation-circle" id="error-icon"></hy-icon>`],
        ])}
        ${this.state == INPUT_STATE.Default && this.type == INPUT_TYPE.CALENDAR
          ? html`<hy-icon name="calendar" type="regular" id="calendar-icon"></hy-icon>`
          : nothing}
        ${this.type == INPUT_TYPE.PASSWORD
          ? choose(this.inputType, [
            [
              INPUT_TYPE.TEXT,
              () =>
                html`<hy-icon
                  name="eye-slash"
                  type="regular"
                  id="password-icon"
                  role="button"
                  aria-label="Hide password"
                  tabindex="0"
                  @click=${!this.disabled ? this._togglePasswordIcon : nothing}
                  @keydown=${this._handleIconKeydown}
                ></hy-icon>`,
            ],
            [
              INPUT_TYPE.PASSWORD,
              () =>
                html`<hy-icon
                  name="eye"
                  type="regular"
                  id="password-icon"
                  role="button"
                  aria-label="Show password"
                  tabindex="0"
                  @click=${!this.disabled ? this._togglePasswordIcon : nothing}
                  @keydown=${this._handleIconKeydown}
                ></hy-icon>`,
            ],
          ])
          : this.type == INPUT_TYPE.NUMBER
            ? html`
              <div id="number-icons">
                ${this.state != INPUT_STATE.Default ? html`<span id="icons-separator">|</span>` : nothing}
                <hy-icon name="minus" @click=${!this.disabled ? this._decrement : nothing}></hy-icon>
                <span id="icons-separator">|</span>
                <hy-icon name="plus" @click=${!this.disabled ? this._increment : nothing}></hy-icon>
              </div>
            `
            : nothing}
      </div>
      <slot name="helper-text"></slot>
    `;
  }

  static override styles = styles;
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-input': NrInputElement;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'nr-input':
        | React.DetailedHTMLProps<React.HTMLAttributes<NrInputElement>, NrInputElement>
        | Partial<NrInputElement>;
    }
  }
}