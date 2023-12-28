import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './checkbox.style.js';

export class CheckBox extends LitElement {

	@property({ type: Boolean })
	checked = false;

	@property({ type: Boolean })
	disabled = false;

	@property({ type: Boolean })
	hasInner = false;

    static override styles = styles;

    override render() {
        return html`

  <div @click="${this.doClick}" class="${this.disabled ? 'disabled' : ''}">
        <span class="checkbox ${ this.checked ? 'isChecked' : 'isUnchecked' }">
          ${this.checked
            ? this.checkedIcon
            : this.unCheckedIcon
          }
        </span>
        ${this.hasInner
          ? html `
            <span class="label">
              <slot></slot>
            </span>`
          : ''
        } 
      </div>
        `;
    }

    doClick() {
    if(this.disabled) {
      return;
    }
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('checkbox-changed', {
      bubbles: true,
      composed: true,
      detail: {
        value: this.checked
      }
    }));
  }

 override firstUpdated() {
    this.hasInner = (this.innerHTML.trim().length) ? true : false;
  }
  get checkedIcon() {
    return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
  }
  get unCheckedIcon() {
    return html`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
  }
}
customElements.define('hy-checkbox', CheckBox);