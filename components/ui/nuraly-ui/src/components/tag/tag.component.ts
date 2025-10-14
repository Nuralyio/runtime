/**
 * @license
 * Copyright 2025 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styles } from './tag.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { TagSize, type TagCheckedChangeDetail } from './tag.types.js';

/**
 * Tag component
 * Features:
 * - Preset colors and custom color support
 * - Closable tags with onClose event
 * - Checkable tags with checked state and change event
 * - Small size variant
 * - Disabled state
 * - Theme-aware through CSS variables
 *
 * @slot - Tag content
 * @slot icon - Optional leading icon
 * @fires nr-tag-close - when the close icon is clicked
 * @fires nr-tag-checked-change - when a checkable tag toggles
 */
@customElement('nr-tag')
export class NrTagElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  /** Tag color preset or custom color string (hex/rgb) */
  @property({ type: String })
  color?: string;

  /** Bordered style */
  @property({ type: Boolean, reflect: true })
  bordered = true;

  /** Small size */
  @property({ type: String })
  size: TagSize = TagSize.Default;

  /** Closable */
  @property({ type: Boolean })
  closable = false;

  /** Checkable */
  @property({ type: Boolean })
  checkable = false;

  /** Checked (for checkable) */
  @property({ type: Boolean, reflect: true })
  checked = false;

  /** Disabled */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Internal closing anim state */
  @state() private closing = false;

  /** Track if an icon is actually provided via slot */
  private lightDomObserver?: MutationObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    // Observe light DOM children to detect when an icon slot is added/removed dynamically
    this.lightDomObserver = new MutationObserver(() => {
      // Trigger re-render so we can recompute hasIcon in render()
      this.requestUpdate();
    });
    this.lightDomObserver.observe(this, { childList: true, subtree: false, attributes: true, attributeFilter: ['slot'] });
  }

  override disconnectedCallback(): void {
    this.lightDomObserver?.disconnect();
    this.lightDomObserver = undefined;
    super.disconnectedCallback();
  }

  private onCloseClick(e: Event) {
    e.stopPropagation();
    if (!this.closable || this.disabled) return;
    this.closing = true;
    // match CSS animation duration ~200ms
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('nr-tag-close', { bubbles: true, composed: true }));
      // Consumers can remove the element on event; keep visible otherwise
      this.closing = false;
    }, 200);
  }

  private onToggleChecked() {
    if (!this.checkable || this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent<TagCheckedChangeDetail>('nr-tag-checked-change', {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    }));
  }

  private isPreset(color?: string): boolean {
    if (!color) return false;
    return PRESET_COLOR_SET.has(color as string);
  }

  override render() {
    const hasIcon = !!this.querySelector('[slot="icon"]');
    const isCustom = !!this.color && !this.isPreset(this.color as string);

    const classes = {
      tag: true,
      'tag--small': this.size === TagSize.Small,
      'tag--borderless': !this.bordered,
      'tag--closable': this.closable,
      'tag--checkable': this.checkable,
      'tag--checked': this.checkable && this.checked,
      'tag--disabled': this.disabled,
      'tag--closing': this.closing,
      // preset color class e.g., tag--red
      ...(this.color && this.isPreset(this.color as string) ? { [`tag--${this.color}`]: true } : {}),
      // custom color modifier
      'tag--custom': isCustom,
    };

    const styleMap: Record<string, string> = {};
    if (isCustom && this.color) {
      styleMap['--nr-tag-custom-bg'] = this.color as string;
    }

  const role = this.checkable ? 'switch' : 'button';
  const ariaPressed: 'true' | 'false' | undefined = this.checkable ? (this.checked ? 'true' : 'false') : undefined;

    return html`
      <span
        class=${classMap(classes)}
        style=${Object.entries(styleMap).map(([k, v]) => `${k}: ${v}`).join(';')}
        role=${role}
        aria-pressed=${ifDefined(ariaPressed)}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        @click=${this.checkable ? this.onToggleChecked : undefined}
      >
        ${hasIcon ? html`<span class="tag__icon"><slot name="icon"></slot></span>` : nothing}
        <span class="tag__content"><slot></slot></span>
        ${this.closable ? html`
          <button class="tag__close" part="close" aria-label="close" ?disabled=${this.disabled} @click=${this.onCloseClick}>
            ×
          </button>
        ` : nothing}
      </span>
    `;
  }
}

const PRESET_COLOR_SET: Set<string> = new Set([
  'magenta','red','volcano','orange','gold','lime','green','cyan','blue','geekblue','purple'
]);

declare global {
  interface HTMLElementTagNameMap {
    'nr-tag': NrTagElement;
  }
}
