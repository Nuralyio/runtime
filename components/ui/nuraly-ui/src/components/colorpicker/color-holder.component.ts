import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {styles} from './color-holder.style.js';
import {ColorPickerSize} from './color-picker.types';

@customElement('hy-colorholder-box')
export class ColerHolderBox extends LitElement {
  @property({type: String})
  color = '#FFFFFF';

  @property({type: String, reflect: true})
  size!: ColorPickerSize;

  static override styles = styles;

  override render() {
    return html` <div class="color-holder-container" style="background-color: ${this.color}"></div> `;
  }
}
