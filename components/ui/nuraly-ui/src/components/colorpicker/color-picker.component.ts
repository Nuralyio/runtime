import {LitElement, PropertyValues, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
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

  @state()
  isValidColor=true

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
      this.checkIsValidColor()
    }
  }
  private async toggleColorHolder() {
    this.show = !this.show;
    await this.updateComplete;
    this.calculateDropDownPosition();
  }
  private onClickOutside = (onClickEvent: Event) => {
    const outsideClick =  !onClickEvent.composedPath().includes(this)
      if(outsideClick)
        this.show =false
  };
  private calculateDropDownPosition = () => {
    const dropdownContainer = this.shadowRoot?.querySelector('.dropdown-container') as HTMLElement;
    const colorHolder = this.shadowRoot?.querySelector('.color-holder')  as HTMLElement;

    if (dropdownContainer && colorHolder) {
      const dropdownRect = dropdownContainer.getBoundingClientRect();
      const colorHolderRect = colorHolder.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Check if the dropdown is going out of the viewport vertically
      if (colorHolderRect.bottom + dropdownRect.height > viewportHeight) {
        // Move the dropdown upwards if it goes out of the viewport
        dropdownContainer.style.top = `${colorHolderRect.top - dropdownRect.height}px`;
      } else {
        // Otherwise, position it below the color holder
        dropdownContainer.style.top = `${colorHolderRect.bottom}px`;
      }

      // Check if the dropdown is going out of the viewport horizontally
      if (colorHolderRect.right + dropdownRect.width > viewportWidth) {
        // Move the dropdown to the left if it goes out of the viewport
        dropdownContainer.style.left = `${viewportWidth - dropdownRect.width}px`;
      } else {
        // Otherwise, position it to the right of the color holder
        dropdownContainer.style.left = `${colorHolderRect.left}px`;
      }
    }
  };

  private handleColorChanged(colorChangedEvent: CustomEvent) {
    if(this.color !=colorChangedEvent.detail.value){
      this.color = colorChangedEvent.detail.value;
      this.dispatchColorChange()
    }
  }

  private onInputChange(inputChangedEvent: CustomEvent) {
    if(this.color != inputChangedEvent.detail.value){
      this.color = inputChangedEvent.detail.value;
      this.dispatchColorChange()
    }
  }
  private dispatchColorChange(){
    this.dispatchEvent(
      new CustomEvent('color-changed', {
        detail: {
          value: this.color,
        },
      })
    );

  }

  private checkIsValidColor(){
    this.isValidColor = CSS.supports('color',this.color)
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
        <hy-input type="text" .value="${this.color}" @valueChange="${this.onInputChange}" withCopy=${true} .state=${!this.isValidColor?'error':nothing}> </hy-input>
      </div>
    </div> `;
  }
}
