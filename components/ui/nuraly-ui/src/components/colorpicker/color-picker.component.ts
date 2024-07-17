import {LitElement, PropertyValues, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './color-holder.component.js';
import './default-color-sets.component.js';
import styles from './color-picker.style.js';
import {ColorPickerSize} from './color-picker.types.js';

@customElement('hy-color-picker')
export class ColorPicker extends LitElement {
  @property({type: String})
  color = '#ffffff';

  @property({type: Boolean, reflect: true})
  show = false;

  @property({type: Array})
  defaultColorSets: Array<string> = [];

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: String, reflect: true})
  size = ColorPickerSize.Default;

  static override styles = styles;

  constructor() {
    super();
    if (typeof window !== 'undefined') {
      import('vanilla-colorful');
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('scroll', this.calculateDropDownPosition);
    document.addEventListener('click', this.onClickOutside);
  }

  override updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('color')) {
      this.dispatchEvent(
        new CustomEvent('color-changed', {
          detail: {
            value: this.color,
          },
        })
      );
    }
  }
  private async toggleColorHolder(toggleEvent:Event) {
    toggleEvent.stopPropagation()
    this.show = !this.show;
    await this.updateComplete;
    this.calculateDropDownPosition();
  }
  private onClickOutside = (onClickEvent: Event) => {
    const isInsideColorPicker = onClickEvent.composedPath().find((eventTarget)=>{
      return (eventTarget as HTMLElement)?.localName ===  'hy-color-picker';
    })
    if (this.show && !isInsideColorPicker) {
      this.show = false;
    }
  };
  private calculateDropDownPosition = () => {
    if (this.show) {
      const verticalOffSet = 5;
      const dropdownContainer = this.shadowRoot?.querySelector('.dropdown-container') as HTMLElement;
      const dropdownContainerRect = dropdownContainer?.getBoundingClientRect();
      const colorHolder = this.shadowRoot!.querySelector('.color-holder')!.getBoundingClientRect();
      const availableTopSpace = colorHolder?.top;
      const availableBottomSpace = window.visualViewport!.height - colorHolder!.bottom;
      dropdownContainer.style.removeProperty('top');
      if (dropdownContainerRect!.height > availableBottomSpace && availableTopSpace > dropdownContainerRect!.height) {
        dropdownContainer.style.top = `${availableTopSpace - dropdownContainerRect.height - verticalOffSet}px`;
      } else {
        dropdownContainer.style.top = `${colorHolder.bottom + verticalOffSet}px`;
      }
    }
  };
  private handleColorChanged(colorChangedEvent: CustomEvent) {
    this.color = colorChangedEvent.detail.value;
  }

  private onInputChange(inputChangedEvent: CustomEvent) {
    this.color = inputChangedEvent.detail.value;
  }

  override disconnectedCallback(): void {
    document.removeEventListener('click', this.onClickOutside);
    document.removeEventListener('scroll', this.calculateDropDownPosition);
  }

  override render() {
    return html`<div class="color-picker-container">
      <hy-colorholder-box
        class="color-holder"
        color="${this.color}"
        .size=${this.size}
        @click=${!this.disabled ? this.toggleColorHolder : nothing}
      ></hy-colorholder-box>
      <div class='dropdown-container'>
        <hy-default-color-sets .defaultColorSets=${this.defaultColorSets} @color-click="${this.handleColorChanged}">
        </hy-default-color-sets>
        <hex-color-picker
          color="${this.color}"
          @color-changed="${(colorChangedEvent: CustomEvent) => this.handleColorChanged(colorChangedEvent)}"
        ></hex-color-picker>
        <hy-input type="text" .value="${this.color}" @valueChange="${this.onInputChange}" withCopy=${true}> </hy-input>
      </div>
    </div> `;
  }
}
