import { LitElement, html, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './slider-input.style.js';

@customElement('hy-slider-input')
export class SliderInput extends LitElement {
	
	@property({ type: Boolean, reflect: true })
	disabled = false;

	@property({ type: Number })
	max = 100;

	@property({ type: Number })
	min = 0;

	@property({ type: Number })
	step = 1;

	@property({ type: Number })
	value = 0;

	@property({ type: Number })
	_actualMin = 0;

	@property({ type: Number })
	_actualMax = 0;


	@state()
	_input!: HTMLInputElement | null;
	@state()
	_slider! : HTMLInputElement | null;
	@state()
	_thumb! : HTMLInputElement | null;

	static override styles = styles;


	override async firstUpdated() {
		this._input = this.shadowRoot!.querySelector('input');
		this._slider = this.shadowRoot!.querySelector('.range-slider');
		this._thumb = this.shadowRoot!.querySelector('.range-thumb');
		this._actualMin = this.min;
		this._actualMax = this.max;

		if (this.step) {
			const minRemainder = this.min % this.step;
			const maxRemainder = this.max % this.step;
			if (minRemainder !== 0) {
				this.min = this.min - minRemainder;
			}
			if (maxRemainder !== 0) {
				this.max = this.max + this.step - maxRemainder;
			}
		}
	}

	override render() {
		return html`
          <div class="range-container">
	        <div class="range-slider"></div>
	        <div class="range-slider-value"></div>
	        <div class="range-thumb"></div>
	        <input
	          max=${this.max}
	          min=${this.min}
	          step=${this.step}
	          type="range"
	          value=${this.value}
	          ?disabled=${this.disabled}
	          @input=${this._changeHandler}
	        />
	      </div>`;
	}


	override updated(changedProps: PropertyValueMap<any>) {
		if (changedProps.has('value')) {
			this._updateSlider();
		}
	}

	/**
	 * Sets the slider value.
	 */
	_changeHandler() {
		const { value } : any = this._input;
		this.value = value > this._actualMax
			? this._actualMax
			: value < this._actualMin
				? this._actualMin
				: value;
	}

	/**
	 * Updates the slider's value width and thumb position (UI).
	 * @event change
	 */
	_updateSlider() {
		const min = this.min < this._actualMin ? this._actualMin : this.min;
		const max = this.max > this._actualMax ? this._actualMax : this.max;
		const percentage = (this.value - min) / (max - min);
		const thumbWidth = this._thumb!.offsetWidth;
		const sliderWidth = this._slider!.offsetWidth;
		const sliderValueWidth = `${percentage * 100}%`;
		const thumbOffset = `${(sliderWidth - thumbWidth) * percentage}px`;

		this.style.setProperty('--hy-slider-value-width', sliderValueWidth);
		this.style.setProperty('--hy-slider-thumb-offset', thumbOffset);

		// Dispatch the change event for range-slider. (For event handlers.)
		this.dispatchEvent(new Event('change'));
		this.dispatchEvent(new CustomEvent('changed' , {
			detail: {
				value: Number(this.value)
			}
		}));
		this.requestUpdate()
	}
}
