/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './checkbox.style.js';
import { CheckboxSize } from './checkbox.types.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { CheckboxFocusMixin, CheckboxEventMixin } from './mixins/index.js';

/**
 * Versatile checkbox component with support for indeterminate state, theming, and multiple sizes.
 * 
 * @example
 * ```html
 * <nr-checkbox>Check me</nr-checkbox>
 * <nr-checkbox checked>Already checked</nr-checkbox>
 * <nr-checkbox indeterminate>Indeterminate state</nr-checkbox>
 * <nr-checkbox size="large" disabled>Large disabled</nr-checkbox>
 * ```
 * 
 * @fires nr-change - Dispatched when checkbox state changes
 * @fires nr-focus - Dispatched when checkbox receives focus
 * @fires nr-blur - Dispatched when checkbox loses focus
 * @fires nr-keydown - Dispatched on keydown events
 * @fires nr-mouseenter - Dispatched when mouse enters checkbox
 * @fires nr-mouseleave - Dispatched when mouse leaves checkbox
 * 
 * @slot default - Checkbox label content
 */

@customElement('nr-checkbox')
export class NrCheckboxElement extends CheckboxEventMixin(
  CheckboxFocusMixin(
    NuralyUIBaseMixin(LitElement)
  )
) {
  static override styles = styles;
  
  /** Whether the checkbox is checked */
  @property({type: Boolean, reflect: true})
  checked = false;

  /** Whether the checkbox is disabled */
  @property({type: Boolean, reflect: true})
  disabled = false;

  /** Whether the checkbox is in indeterminate state */
  @property({type: Boolean, reflect: true})
  indeterminate = false;

  /** Checkbox size (small, medium, large) */
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

  /** Form field name */
  @property({type: String})
  name?: string;

  /** Form field value */
  @property({type: String})
  value?: string;

  /** Whether the checkbox should be focused when mounted */
  @property({type: Boolean})
  autoFocus = false;

  /** Checkbox title attribute */
  @property({type: String})
  override title = '';

  /** Tab index */
  @property({type: Number})
  override tabIndex = 0;

  /** Whether the checkbox is required */
  @property({type: Boolean})
  required = false;

  /** Checkbox ID */
  @property({type: String})
  override id = '';

  // Focus/blur methods and nativeElement are now provided by CheckboxFocusMixin

  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
    
    // Handle autoFocus
    if (this.autoFocus) {
      // Use requestAnimationFrame to ensure the element is fully rendered
      requestAnimationFrame(() => {
        this.focus();
      });
    }
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    // Update data-theme attribute on host for CSS theming
    this.setAttribute('data-theme', this.currentTheme);
  }

  private getCommonAttributes() {
    return {
      'data-theme': this.currentTheme,
      'data-size': this.size
    };
  }

  private handleLabelClick(event: Event) {
    // Prevent double-firing when clicking the label
    if (!this.disabled) {
      event.preventDefault();
      this.checked = !this.checked;
      // Fire change event manually since we prevented the default
      this.dispatchEvent(new CustomEvent('nr-change', {
        detail: { checked: this.checked, value: this.value },
        bubbles: true
      }));
    }
  }

  override render() {
    const commonAttributes = this.getCommonAttributes();
    
    return html`
      <input 
        type="checkbox" 
        .checked=${this.checked} 
        .disabled=${this.disabled} 
        .indeterminate=${this.indeterminate}
        name=${this.name ?? ''}
        value=${this.value ?? ''}
        id=${this.id}
        title=${this.title}
        ?required=${this.required}
        data-theme="${commonAttributes['data-theme']}"
        data-size="${commonAttributes['data-size']}"
        aria-checked=${this.indeterminate ? 'mixed' : (this.checked ? 'true' : 'false')}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        tabindex=${this.disabled ? -1 : (this.tabIndex ?? 0)}
        @change=${this.handleChange} 
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
        @keydown=${this.handleKeydown}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      />
      <label class="checkbox-label" for=${this.id} @click=${this.handleLabelClick}>
        <slot></slot>
      </label>
    `;
  }

  // Event handling methods are now provided by CheckboxEventMixin
}
