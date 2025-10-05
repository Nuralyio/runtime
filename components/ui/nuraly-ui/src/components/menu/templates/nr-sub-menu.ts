/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, PropertyValues, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './sub-menu.style.js';
import { EMPTY_STRING } from '../menu.constants.js';
import { IMenu } from '../menu.types.js';
import '../../icon/icon.component.js';

@customElement('nr-sub-menu')
export class NrSubMenu extends LitElement {
  @property()
  text!: string;

  @property({ reflect: true })
  icon = EMPTY_STRING;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  highlighted = false;

  @state()
  isOpen = false;

  @state()
  hovered = false;

  @property({ type: Boolean, reflect: true })
  selected = false;

  @property({ type: Object })
  menu!: IMenu;

  @property({ type: Object })
  status!: { icon: string; label: string };

  optionPath!: number[];

  override connectedCallback(): void {
    super.connectedCallback();
    this.optionPath = this.getAttribute('data-path')!.split('-').map((stringValue) => +stringValue);
    this.addEventListener('mouseenter', () => {
      this.hovered = true
    });
    this.addEventListener('mouseleave', () => {
      this.hovered = false
    });
  }

  _toggleMenu(event: Event) {
    if (((event?.target as HTMLElement)?.className != 'action-icon') && ((event?.target as HTMLElement)?.id != 'toggle-icon')) {
      if (!this.isOpen) {
        this.isOpen = !this.isOpen;
      }
      this.dispatchEvent(new CustomEvent('select-menu', {
        bubbles: true,
        composed: true,
        detail: { value: this.text, path: this.optionPath },
      }));
      this.highlighted = true
    }
  }

  toggleIcon() {
    this.isOpen = !this.isOpen
  }

  _handleSelectedChild() {
    this.highlighted = true;
  }

  onActionClick(e: CustomEvent) {
    console.log(e.detail)
    this.dispatchEvent(new CustomEvent('action-click', { detail: { value: e.detail.value, path: this.optionPath, additionalData: e.detail.additionalData}, composed: true, bubbles: true }))
  }
  protected override updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('menu')) {
      const previousMenu = _changedProperties.get('menu') as typeof this.menu;
      if (previousMenu?.opened !== this.menu?.opened) {
        if (this.menu?.opened) {
          this.isOpen = this.menu.opened;
        }
      }
    }
  }

  override render() {
    return html`
    <ul tabindex="0">
        <div @mousedown=${!this.disabled ? this._toggleMenu : nothing}>
          ${this.icon ? html`<nr-icon id="text-icon" name="${this.icon}"></nr-icon>` : nothing}
          <span>${this.text}</span>
          <div class="icons-container">
          ${this.status?.icon ? html`
              <nr-icon name=${this.status.icon} class="status-icon" ></nr-icon>
            `: nothing}
          ${(this.highlighted || this.hovered) && this.menu?.menu?.actions ? html`
            <hy-dropdown .options=${this.menu.menu.actions} @click-item=${this.onActionClick} .trigger=${"click"}>
              <nr-icon name="${this.menu.menu.icon}" class="action-icon"></nr-icon>
            </hy-dropdown>
            `: nothing}
            ${this.menu?.children && this.menu.children.length ? html`<nr-icon id="toggle-icon" name="${this.isOpen ? 'angle-up' : 'angle-down'}" @mousedown=${!this.disabled ? this.toggleIcon : nothing}></nr-icon>` : nothing}
          </div>
        </div>
        <slot @select-menu=${this._handleSelectedChild} @selected-link=${this._handleSelectedChild} style="display:${this.isOpen ? nothing : 'none'};"></slot>
      </ul>
    `;
  }
  static override styles = styles;
}
