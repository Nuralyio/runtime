import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./label.style.js";
import { LabelSize, LabelVariant } from './label.types.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';

@customElement('nr-label')
export class HyTextLabel extends NuralyUIBaseMixin(LitElement) {
    static override styles = styles;

    @property({ reflect: true })
    size: LabelSize = 'medium';

    @property({ reflect: true })
    variant: LabelVariant = 'default';

    @property({ type: Boolean, reflect: true })
    required = false;

    @property({ type: Boolean, reflect: true })
    disabled = false;

    @property()
    for?: string;

    @property()
    value = '';

    override connectedCallback() {
        super.connectedCallback();
        this.updateDataTheme();
    }

    override updated() {
        this.updateDataTheme();
    }

   private updateDataTheme() {
        if (!this.closest('[data-theme]')) {
            this.setAttribute('data-theme', this.currentTheme);
        }
    }

    override render() {
        return html`
            <label for=${this.for || ''}>
                <slot></slot>
                ${this.required ? html`<span class="required-asterisk">*</span>` : ''}
            </label>
        `;
    }
}