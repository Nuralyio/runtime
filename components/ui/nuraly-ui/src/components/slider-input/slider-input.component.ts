import { LitElement, html, PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './slider-input.style.js';
import { debounce } from './utils/index.js';

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

	@state()
	_actualMin = 0;

	@state()
	_actualMax = 0;


	@state()
	_input!: HTMLInputElement | null;
	@state()
	_slider! : HTMLInputElement | null;
	@state()
	_thumb! : HTMLInputElement | null;

	static override styles = styles;


	override async firstUpdated() {
		await this.updateComplete;
		
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

		// Initial visual update
		requestAnimationFrame(() => {
			this._updateSliderVisuals();
		});
	}

	override render() {
		return html`
		  <div class="slider-wrapper">
	        <input
	          max=${this.max}
	          min=${this.min}
	          step=${this.step}
	          type="range"
	          value=${this.value}
	          ?disabled=${this.disabled}
	          @input=${this._inputHandler}
	          @change=${this._changeHandler}
	        />
            <div class="range-container">
	          <div class="range-slider"></div>
	          <div class="range-slider-value"></div>
	          <div class="range-thumb"></div>
	        </div>
	      </div>`;
	}


	override updated(changedProps: PropertyValueMap<any>) {
		if (changedProps.has('value') || changedProps.has('min') || changedProps.has('max')) {
			// Use requestAnimationFrame to ensure DOM is updated before calculating positions
			requestAnimationFrame(() => {
				this._updateSliderVisuals();
			});
		}
	}

	/**
	 * Handles input events for immediate visual feedback during dragging.
	 */
	_inputHandler(event: Event) {
		event.stopPropagation();
		const input = event.target as HTMLInputElement;
		const newValue = Number(input.value);
		
		// Clamp value to actual min/max bounds
		this.value = newValue > this._actualMax
			? this._actualMax
			: newValue < this._actualMin
				? this._actualMin
				: newValue;
		
		// Update visuals immediately for smooth dragging
		this._updateSliderVisuals();
		this.requestUpdate();
	}

	/**
	 * Handles change events when dragging is complete.
	 */
	_changeHandler(event: Event) {
		event.stopPropagation();
		const input = event.target as HTMLInputElement;
		const newValue = Number(input.value);
		
		// Clamp value to actual min/max bounds
		this.value = newValue > this._actualMax
			? this._actualMax
			: newValue < this._actualMin
				? this._actualMin
				: newValue;
		
		// Dispatch events when dragging is complete
		this._dispatchChangeEvents();
		this.requestUpdate();
	}

	/**
	 * Updates the slider's visual appearance immediately (no debounce for smooth dragging).
	 */
	_updateSliderVisuals() {
		if (!this._thumb || !this._slider) return;
		
		const min = this.min < this._actualMin ? this._actualMin : this.min;
		const max = this.max > this._actualMax ? this._actualMax : this.max;
		const range = max - min;
		
		if (range === 0) return; // Avoid division by zero
		
		const percentage = Math.max(0, Math.min(1, (this.value - min) / range));
		const thumbWidth = this._thumb.offsetWidth || 20; // Fallback if not measured yet
		const sliderWidth = this._slider.offsetWidth || 200; // Fallback if not measured yet
		
		const sliderValueWidth = `${percentage * 100}%`;
		// Calculate thumb position so it stays within track bounds
		const maxThumbOffset = sliderWidth - thumbWidth;
		const thumbOffset = `${Math.max(0, Math.min(maxThumbOffset, maxThumbOffset * percentage))}px`;

		this.style.setProperty('--nr-slider-value-width', sliderValueWidth);
		this.style.setProperty('--nr-slider-thumb-offset', thumbOffset);
	}

	/**
	 * Dispatches change events (debounced to avoid excessive event firing).
	 */
	_dispatchChangeEvents = debounce(() => {
		// Dispatch the change event for range-slider. (For event handlers.)
		this.dispatchEvent(new Event('change'));
		this.dispatchEvent(new CustomEvent('changed' , {
			detail: {
				value: Number(this.value)
			}
		}));
	}, 50); // Reduced debounce time for more responsive events

	/**
	 * Updates the slider's value width and thumb position (UI) and dispatches events.
	 */
	_updateSlider() {
		this._updateSliderVisuals();
		this._dispatchChangeEvents();
		this.requestUpdate();
	}
}
customElements.define('nr-slider-input', SliderInput);
