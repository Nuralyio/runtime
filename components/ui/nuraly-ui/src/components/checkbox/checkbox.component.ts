/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './checkbox.style.js';
import { CheckboxSize } from './checkbox.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';

@customElement('nr-checkbox')
export class NrCheckboxElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;
  @property({type: Boolean, reflect: true})
  checked = false;

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  indeterminate = false;

  @property({reflect: true})
  get size(): CheckboxSize {
    return this._size;
  }
  set size(value: CheckboxSize) {
    const validSizes = [CheckboxSize.Small, CheckboxSize.Medium, CheckboxSize.Large];
    if (validSizes.includes(value)) {
      this._size = value;
    } else {
      console.warn(`Invalid size value: ${value}. Using default size: ${CheckboxSize.Medium}`);
      this._size = CheckboxSize.Medium;
    }
  }
  private _size: CheckboxSize = CheckboxSize.Medium;

  @property({type: String})
  name?: string;

  @property({type: String})
  value?: string;

  override connectedCallback() {
    super.connectedCallback();
    this.updateThemeFromParent();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    this.updateThemeFromParent();
  }

  private updateThemeFromParent() {
    // Check for parent container theme first
    const parentTheme = this.closest('[data-theme]')?.getAttribute('data-theme');
    const effectiveTheme = parentTheme || this.currentTheme;
    this.setAttribute('data-theme', effectiveTheme);
  }

  override render() {
    // Check for parent container theme first
    const parentTheme = this.closest('[data-theme]')?.getAttribute('data-theme');
    const effectiveTheme = parentTheme || this.currentTheme;
    
    return html`
      <input 
        type="checkbox" 
        .checked=${this.checked} 
        .disabled=${this.disabled} 
        .indeterminate=${this.indeterminate}
        name=${this.name ?? ''}
        value=${this.value ?? ''}
        data-theme="${effectiveTheme}"
        aria-checked=${this.indeterminate ? 'mixed' : (this.checked ? 'true' : 'false')}
        @change=${this.onChange} 
      />
      <slot></slot>
    `;
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (this.indeterminate) {
      this.indeterminate = false;
    }
    this.checked = target.checked;
    this.dispatchEvent(
      new CustomEvent('nr-change', {
        bubbles: true,
        composed: true,
        detail: {
          value: this.checked,
        },
      })
    );
  }
}
