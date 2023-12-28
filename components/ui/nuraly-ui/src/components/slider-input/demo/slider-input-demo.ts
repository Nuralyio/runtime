import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
@customElement('hy-slider-input-demo')
export class SliderInputDemi extends LitElement {
    static override styles = [
        css`
           :host {
        --hy-slider-width: 129px;

        font: normal 14px/1.4 Helvetica, Arial, sans-serif;
      }

      fieldset {
        border: 0;
        display: flex;
        flex-direction: column;
        margin: 10px 0;
        padding: 10px;
      }

      legend {
        font-size: 20px;
        font-weight: 600;
        padding: 0;
      }

      range-slider {
        width: var(--hy-slider-width);
      }

      #slider-custom-styles {
        --hy-slider-height: 15px;
        --hy-slider-background: orange;
        --hy-slider-value-color: green;
        --hy-slider-thumb-color: pink;
        --hy-slider-thumb-diameter: 30px;
      }

      label {
        align-items: center;
        display: flex;
        margin: 0 0 10px;
      }

      p {
        margin: 0;
      }

      #chk-toggle-disabled {
        margin: 0 10px 0 0;
      }

      #txt-change-via-textbox,
      #slider-change-via-textbox,
      #slider-toggle-disabled {
        margin: 0 0 20px;
        width: var(--hy-slider-width);
      }

      .slider-limits {
        display: flex;
        justify-content: space-between;
        width: var(--hy-slider-width);
      }
        `
    ];
      @property({ type: Number }) _sliderChangeViaTextboxValue = 15;
  @property({ type: Boolean }) _sliderDisabled = false;
  @property({ type: Number }) _sliderMinMaxNotMultipleOfStepValue = 45678;
  @property({ type: Number }) _sliderWithChangeHandlerValue = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 0;


  /**
   * Sets the slider's disabled prop.
   */
  _toggleDisabled() {
    this._sliderDisabled = !this._sliderDisabled;
  }

  /**
   * Updates the slider prop's value.
   * @param {EventObject} e The event object.
   */
   _updateValue(e :any) {
    const [element] = e.composedPath();
    const { format, prop } = element.dataset;
    const propToUpdate = `_${(prop)}Value`;
    const value = format
      ? (element.value, JSON.parse(format))
      : element.value;

    (this as any)[propToUpdate] = value;
  }

    override render() {
        return html`
          <fieldset>
        <legend>Default</legend>
        <hy-slider-input
          id="slider-default"
          .min=${0}
          .max=${100}
          .value=${20}
        ></hy-slider-input>
      </fieldset>
      <fieldset>
        <legend>With Change Handler</legend>
        <hy-slider-input
          id="slider-with-change-handler"
          data-prop="slider-with-change-handler"
          data-format=${JSON.stringify({
            options: {
              style: 'currency',
              currency: 'USD',
            },
          })}
          .min=${0}
          .max=${1000000}
          .step=${100000}
          .value=${400000}
          @change=${this._updateValue}
        ></hy-slider-input>
        <p class="slider-value">${this._sliderWithChangeHandlerValue}</p>
      </fieldset>
      <fieldset>
        <legend>Custom Styles</legend>
        <hy-slider-input
          id="slider-custom-styles"
          .min=${0}
          .max=${100}
          .value=${50}
        ></hy-slider-input>
      </fieldset>
      <fieldset id="toggle-disabled">
        <legend>Toggle Disabled Status</legend>
        <label for="chk-toggle-disabled">
          <input
            id="chk-toggle-disabled"
            type="checkbox"
            .checked=${this._sliderDisabled}
            @input=${this._toggleDisabled}
          />
          Disable Slider
        </label>
        <hy-slider-input
          id="slider-toggle-disabled"
          .disabled=${this._sliderDisabled}
          .min=${0}
          .max=${100}
          .value=${75}
        ></hy-slider-input>
      </fieldset>
      <fieldset id="change-via-textbox">
        <legend>Change via Textbox</legend>
        <input
          id="txt-change-via-textbox"
          data-prop="slider-change-via-textbox"
          max="100"
          min="0"
          type="number"
          .value=${this._sliderChangeViaTextboxValue}
          @input=${this._updateValue}
        />
        <hy-slider-input
          id="slider-change-via-textbox"
          data-prop="slider-change-via-textbox"
          .min=${0}
          .max=${100}
          .value=${this._sliderChangeViaTextboxValue}
          @change=${this._updateValue}
        ></hy-slider-input>
      </fieldset>
      <fieldset id="not-multiple-of-step">
        <legend>Not Multiple of Step</legend>
        <p>${(this._sliderMinMaxNotMultipleOfStepValue)}</p>
        <hy-slider-input
          id="slider-min-max-not-multiple-of-step"
          data-prop="slider-min-max-not-multiple-of-step"
          .min=${this.min}
          .max=${this.max}
          .step=${10000}
          .value=${this._sliderMinMaxNotMultipleOfStepValue}
          @change=${this._updateValue}
        ></hy-slider-input>
        <div class="slider-limits">
          <span>${(this.min)}</span>
          <span>${(this.max)}</span>
        </div>
      </fieldset>;`
          }
}
