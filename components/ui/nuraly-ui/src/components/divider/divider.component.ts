import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from "./divider.style.js";

@customElement('hy-divider')
export class HyDivider extends LitElement {
  static override styles = styles;

  @property({type: String})
  color = '';

  @property({type: String})
  darkColor = '';

  @property({type: String})
  lightColor = '';

  @property({type: String})
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  @property({type: Number})
  thickness = 1;

  override willUpdate(changedProperties: {has: (arg0: string) => any}) {
    if (changedProperties.has('color')) {
      this.style.setProperty('--nr-divider-color', this.color);
    }
    if (changedProperties.has('darkColor')) {
      this.style.setProperty('--nr-divider-local-dark-color', this.darkColor);
    }
    if (changedProperties.has('lightColor')) {
      this.style.setProperty('--nr-divider-local-light-color', this.lightColor);
    }
    if (changedProperties.has('thickness')) {
      this.style.setProperty('--nr-divider-thickness', `${this.thickness}px`);
    }
  }

  override render() {
    return html` <div class="divider ${this.orientation}"></div> `;
  }
}