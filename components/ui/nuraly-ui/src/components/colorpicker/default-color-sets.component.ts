import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './default-color-sets.style.js';
import './color-holder.component.js';
@customElement('hy-default-color-sets')
export class DefaultColorSets extends LitElement {
  @property({type: Array})
  defaultColorSets: Array<string> = [];

  static override styles = styles;

  handleColorClick(color: string) {
    this.dispatchEvent(
      new CustomEvent('color-click', {
        detail: {
          value: color,
        },
      })
    );
  }

  override render() {
    return html`
      <div class="default-color-sets-container">
        ${this.defaultColorSets.map(
          (color) =>
            html`<hy-colorholder-box
              @click=${() => this.handleColorClick(color)}
              color="${color}"
              class='color-set-container'
            ></hy-colorholder-box>`
        )}
      </div>
    `;
  }
}
