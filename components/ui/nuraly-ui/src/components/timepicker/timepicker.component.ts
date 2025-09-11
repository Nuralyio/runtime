import { LitElement, html, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

// Import UI components
import '../input/input.component.js';
import '../button/button.component.js';
import { INPUT_STATE } from '../input/input.types.js';

// Import base mixin and types
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import { SharedDropdownController } from '../../shared/controllers/dropdown.controller.js';
import { DropdownHost } from '../../shared/controllers/dropdown.interface.js';
import {
    TimeValue,
    TimeFormat,
    TimePickerConfig,
    TimePickerState,
    TimePickerPlacement,
    TimeConstraints,
    TimePeriod,
    TimeStep,
    EMPTY_TIME_VALUE,
    TIME_PICKER_EVENTS,
} from './timepicker.types.js';

// Import controllers
import { TimePickerSelectionController } from './controllers/selection.controller.js';
import { TimePickerValidationController } from './controllers/validation.controller.js';
import { TimePickerFormattingController } from './controllers/formatting.controller.js';

// Import utilities
import { TimeUtils } from './utils/time.utils.js';

// Import styles
import { styles as timePickerStyles } from './timepicker.style.js';

// Host interface for controllers
export interface TimePickerHost extends LitElement, DropdownHost {
  getCurrentTime(): TimeValue;
  setTime(time: TimeValue): void;
  formatTime(time: TimeValue): string;
  parseTime(timeString: string): TimeValue | null;
  getConfig(): TimePickerConfig;
  validateTime(time: TimeValue): boolean;
  requestUpdate(): void;
}

/**
 * A comprehensive time picker component that supports both 12-hour and 24-hour formats,
 * with optional seconds display and extensive customization options.
 * 
 * @example
 * ```html
 * <nr-timepicker 
 *   value="14:30:00" 
 *   format="24h" 
 *   show-seconds
 *   placeholder="Select time">
 * </nr-timepicker>
 * ```
 */
@customElement('nr-timepicker')
export class NrTimePickerElement extends NuralyUIBaseMixin(LitElement) implements TimePickerHost {
  static override styles = [timePickerStyles];

  // Properties
  @property({ type: String }) value = '';
  @property({ type: String }) name = '';
  @property({ type: String }) placeholder = 'Select time';
  @property({ type: String }) format: TimeFormat = TimeFormat.TwentyFourHour;
  @property({ type: Boolean, attribute: 'show-seconds' }) showSeconds = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Boolean }) required = false;
  @property({ type: String, attribute: 'min-time' }) minTime?: string;
  @property({ type: String, attribute: 'max-time' }) maxTime?: string;
  @property({ type: Array, attribute: 'disabled-times' }) disabledTimes?: string[];
  @property({ type: Array, attribute: 'enabled-times' }) enabledTimes?: string[];
  @property({ type: String, attribute: 'helper-text' }) helperText = '';
  @property({ type: String }) label = '';
  @property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium';
  @property({ type: String }) variant: 'outlined' | 'filled' | 'standard' = 'outlined';
  @property({ type: String }) placement: TimePickerPlacement = TimePickerPlacement.Bottom;
  
  /** Scroll behavior for dropdown navigation - 'instant' for immediate, 'smooth' for animated, 'auto' for browser default */
  @property({ type: String, attribute: 'scroll-behavior' }) scrollBehavior: 'auto' | 'instant' | 'smooth' = 'instant';

  // State
  @state() private inputValue = '';
  @state() private state: TimePickerState = TimePickerState.Default;
  @state() private validationMessage = '';

  // Controllers
  private dropdownController = new SharedDropdownController(this);
  private selectionController = new TimePickerSelectionController(this);
  private validationController = new TimePickerValidationController(this);
  private formattingController = new TimePickerFormattingController(this);

  constructor() {
    super();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.updateConstraints();
    if (this.value) {
      this.setTimeFromValue(this.value);
    }
    
    // Add global click listener to close dropdown when clicking outside
    this.addEventListener('click', this.handleComponentClick.bind(this));
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    // Clean up global event listeners
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  override updated(changedProperties: Map<string, any>): void {
    super.updated(changedProperties);

    if (changedProperties.has('value') && this.value !== this.inputValue) {
      this.setTimeFromValue(this.value);
      // Scroll to the selected time when value changes from outside
      if (this.dropdownController.isOpen) {
        setTimeout(() => {
          this.scrollToSelectedTime();
        }, 50);
      }
    }

    if (this.shouldUpdateConstraints(changedProperties)) {
      this.updateConstraints();
    }

    // Set up dropdown elements
    this.setupDropdownElements();
  }

  private setupDropdownElements(): void {
    const dropdown = this.shadowRoot?.querySelector('.time-picker__dropdown') as HTMLElement;
    const trigger = this.shadowRoot?.querySelector('.time-picker__input-wrapper') as HTMLElement;
    
    if (dropdown && trigger) {
      this.dropdownController.setElements(dropdown, trigger);
    }
  }

  override render(): TemplateResult {
    const wrapperClasses = {
      'time-picker': true,
      'time-picker--open': this.dropdownController.isOpen,
      'time-picker--disabled': this.disabled,
      'time-picker--readonly': this.readonly,
      'time-picker--error': this.state === TimePickerState.Error,
    };

    return html`
      <div class="${classMap(wrapperClasses)}" data-theme="${this.currentTheme}" part="wrapper">
        ${this.renderLabel()}
        ${this.renderInput()}
        ${this.renderDropdown()}
        ${this.renderHelperText()}
      </div>
    `;
  }

  // Public API methods
  open(): void { 
    this.dropdownController.open();
    // Scroll to selected time when opening programmatically
    setTimeout(() => {
      this.scrollToSelectedTime();
    }, 50);
  }
  close(): void { this.dropdownController.close(); }
  clear(): void { 
    this.value = '';
    this.inputValue = '';
    this.selectionController.clearSelection();
  }
  
  setToNow(): void {
    const now = TimeUtils.getCurrentTime();
    this.selectionController.selectTime(now);
    this.updateInputValue();
    // Scroll to the newly selected time if dropdown is open
    if (this.dropdownController.isOpen) {
      setTimeout(() => {
        this.scrollToSelectedTime();
      }, 10);
    }
  }

  validate(): boolean {
    const selectedTime = this.selectionController.getSelectedTime();
    if (!selectedTime) return true;
    return this.validationController.validateConstraints(selectedTime);
  }

  validateTime(time: TimeValue): boolean {
    return this.validationController.validateConstraints(time);
  }

  // Helper methods for checking if individual time components are valid
  private isHourValid(hour: number, selectedTime: TimeValue): boolean {
    const testTime = { ...selectedTime, hours: hour };
    return this.validateTime(testTime);
  }

  private isMinuteValid(minute: number, selectedTime: TimeValue): boolean {
    const testTime = { ...selectedTime, minutes: minute };
    return this.validateTime(testTime);
  }

  private isSecondValid(second: number, selectedTime: TimeValue): boolean {
    const testTime = { ...selectedTime, seconds: second };
    return this.validateTime(testTime);
  }

  // Private methods
  private renderLabel(): TemplateResult | typeof nothing {
    if (!this.label) return nothing;

    return html`
      <label class="time-picker__label" part="label" for="time-input">
        ${this.label}
        ${this.required ? html`<span class="time-picker__required">*</span>` : nothing}
      </label>
    `;
  }

  private renderInput(): TemplateResult {
    const formatPlaceholder = this.getFormatPlaceholder();
    
    return html`
      <div class="time-picker__input-wrapper" part="input-wrapper">
        <nr-input
          id="time-input"
          part="input"
          type="calendar"
          .value="${this.inputValue}"
          placeholder="${this.placeholder || formatPlaceholder}"
          ?disabled="${this.disabled}"
          ?readonly="${false}"
          ?required="${this.required}"
          .state="${this.state === TimePickerState.Error ? INPUT_STATE.Error : INPUT_STATE.Default}"
          @click="${this.handleInputClick}"
          @nr-input="${this.handleInputChange}"
          @nr-blur="${this.handleInputBlur}"
        >
        </nr-input>
      </div>
    `;
  }

  private renderDropdown(): TemplateResult | typeof nothing {
    if (!this.dropdownController.isOpen) return nothing;

    return html`
      <div 
        class="time-picker__dropdown time-picker__dropdown--open" 
        part="dropdown"
        @click="${this.handleDropdownClick}"
      >
        ${this.renderColumnPicker()}
        ${this.renderActions()}
      </div>
    `;
  }

  private renderColumnPicker(): TemplateResult {
    const selectedTime = this.selectionController.getSelectedTime();
    const config = this.getConfig();

    return html`
      <div class="time-picker__columns" part="columns">
        ${this.renderHourColumn(selectedTime, config)}
        ${this.renderMinuteColumn(selectedTime)}
        ${this.showSeconds ? this.renderSecondColumn(selectedTime) : nothing}
      </div>
    `;
  }

  private renderHourColumn(selectedTime: TimeValue | null, config: TimePickerConfig): TemplateResult {
    const hours = config.format === TimeFormat.TwelveHour 
      ? Array.from({ length: 12 }, (_, i) => i === 0 ? 12 : i)
      : Array.from({ length: 24 }, (_, i) => i);

    const displayHour = selectedTime && config.format === TimeFormat.TwelveHour
      ? this.formattingController.formatHours(selectedTime.hours)
      : selectedTime?.hours;

    return html`
      <div class="time-picker__column" part="hour-column">
        <div class="time-picker__column-list">
          ${hours.map(hour => {
            // Convert display hour to actual hour for validation
            let actualHour = hour;
            if (config.format === TimeFormat.TwelveHour && selectedTime) {
              const currentPeriod = this.formattingController.getPeriod(selectedTime.hours);
              if (hour === 12) {
                actualHour = currentPeriod === TimePeriod.AM ? 0 : 12;
              } else {
                actualHour = currentPeriod === TimePeriod.AM ? hour : hour + 12;
              }
            }
            
            // Use EMPTY_TIME_VALUE for validation when no time is selected
            const timeForValidation = selectedTime || EMPTY_TIME_VALUE;
            const isValid = this.isHourValid(actualHour, timeForValidation);
            const isSelected = selectedTime ? hour === displayHour : false;
            
            return html`
              <div
                class="time-picker__column-item ${isSelected ? 'time-picker__column-item--selected' : ''} ${!isValid ? 'time-picker__column-item--disabled' : ''}"
                @click="${isValid ? () => this.handleHourSelect(hour, config.format) : null}"
              >
                ${hour.toString().padStart(2, '0')}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderMinuteColumn(selectedTime: TimeValue | null): TemplateResult {
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return html`
      <div class="time-picker__column" part="minute-column">
        <div class="time-picker__column-list">
          ${minutes.map(minute => {
            // Use EMPTY_TIME_VALUE for validation when no time is selected
            const timeForValidation = selectedTime || EMPTY_TIME_VALUE;
            const isValid = this.isMinuteValid(minute, timeForValidation);
            const isSelected = selectedTime ? minute === selectedTime.minutes : false;
            
            return html`
              <div
                class="time-picker__column-item ${isSelected ? 'time-picker__column-item--selected' : ''} ${!isValid ? 'time-picker__column-item--disabled' : ''}"
                @click="${isValid ? () => this.handleMinuteSelect(minute) : null}"
              >
                ${minute.toString().padStart(2, '0')}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderSecondColumn(selectedTime: TimeValue | null): TemplateResult {
    const seconds = Array.from({ length: 60 }, (_, i) => i);

    return html`
      <div class="time-picker__column" part="second-column">
        <div class="time-picker__column-list">
          ${seconds.map(second => {
            // Use EMPTY_TIME_VALUE for validation when no time is selected
            const timeForValidation = selectedTime || EMPTY_TIME_VALUE;
            const isValid = this.isSecondValid(second, timeForValidation);
            const isSelected = selectedTime ? second === selectedTime.seconds : false;
            
            return html`
              <div
                class="time-picker__column-item ${isSelected ? 'time-picker__column-item--selected' : ''} ${!isValid ? 'time-picker__column-item--disabled' : ''}"
                @click="${isValid ? () => this.handleSecondSelect(second) : null}"
              >
                ${second.toString().padStart(2, '0')}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderActions(): TemplateResult {
    return html`
      <div class="time-picker__actions">
        <nr-button
          type="ghost"
          size="small"
          @click="${() => this.setToNow()}"
        >
          Now
        </nr-button>
        <nr-button
          type="primary"
          size="small"
          @click="${this.handleOkClick}"
        >
          OK
        </nr-button>
      </div>
    `;
  }

  private renderHelperText(): TemplateResult | typeof nothing {
    const text = this.validationMessage || this.helperText;
    if (!text) return nothing;

    const isError = this.state === TimePickerState.Error || !!this.validationMessage;

    return html`
      <div class="time-picker__helper-text ${isError ? 'time-picker__helper-text--error' : ''}" part="helper-text">
        ${text}
      </div>
    `;
  }

  private scrollToSelectedTime(): void {
    try {
      const selectedTime = this.selectionController.getSelectedTime();
      if (!selectedTime) return;

      // Scroll each column to the selected value
      this.scrollToSelectedHour(selectedTime);
      this.scrollToSelectedMinute(selectedTime);
      if (this.showSeconds) {
        this.scrollToSelectedSecond(selectedTime);
      }
    } catch (error) {
      console.warn('Failed to scroll to selected time:', error);
    }
  }

  private scrollToSelectedHour(selectedTime: TimeValue): void {
    const config = this.getConfig();
    const hourColumn = this.shadowRoot?.querySelector('.time-picker__column:first-child .time-picker__column-list') as HTMLElement;
    
    if (!hourColumn) return;

    let displayHour: number;
    if (config.format === TimeFormat.TwelveHour) {
      // Convert 24-hour to 12-hour format
      if (selectedTime.hours === 0 || selectedTime.hours === 12) {
        displayHour = 12;
      } else {
        displayHour = selectedTime.hours > 12 ? selectedTime.hours - 12 : selectedTime.hours;
      }
    } else {
      displayHour = selectedTime.hours;
    }

    // Find the selected hour element
    const selectedHourElement = hourColumn.querySelector(`.time-picker__column-item:nth-child(${this.getHourIndex(displayHour, config.format) + 1})`) as HTMLElement;
    
    if (selectedHourElement) {
      selectedHourElement.scrollIntoView({
        behavior: this.scrollBehavior as ScrollBehavior,
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private scrollToSelectedMinute(selectedTime: TimeValue): void {
    const minuteColumn = this.shadowRoot?.querySelector('.time-picker__column:nth-child(2) .time-picker__column-list') as HTMLElement;
    
    if (!minuteColumn) return;

    // Find the selected minute element (minute + 1 because nth-child is 1-indexed)
    const selectedMinuteElement = minuteColumn.querySelector(`.time-picker__column-item:nth-child(${selectedTime.minutes + 1})`) as HTMLElement;
    
    if (selectedMinuteElement) {
      selectedMinuteElement.scrollIntoView({
        behavior: this.scrollBehavior as ScrollBehavior,
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private scrollToSelectedSecond(selectedTime: TimeValue): void {
    const secondColumn = this.shadowRoot?.querySelector('.time-picker__column:nth-child(3) .time-picker__column-list') as HTMLElement;
    
    if (!secondColumn) return;

    // Find the selected second element (second + 1 because nth-child is 1-indexed)
    const selectedSecondElement = secondColumn.querySelector(`.time-picker__column-item:nth-child(${selectedTime.seconds + 1})`) as HTMLElement;
    
    if (selectedSecondElement) {
      selectedSecondElement.scrollIntoView({
        behavior: this.scrollBehavior as ScrollBehavior,
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  private getHourIndex(displayHour: number, format: TimeFormat): number {
    if (format === TimeFormat.TwelveHour) {
      // For 12-hour format: 12, 1, 2, ..., 11
      return displayHour === 12 ? 0 : displayHour;
    } else {
      // For 24-hour format: 0, 1, 2, ..., 23
      return displayHour;
    }
  }

  // Event handlers
  private handleComponentClick(e: Event): void {
    // Stop propagation to prevent document click handler from firing
    e.stopPropagation();
  }

  private handleDocumentClick(e: Event): void {
    // Close dropdown when clicking outside the component
    if (this.dropdownController.isOpen) {
      const target = e.target as Element;
      const isClickInsideComponent = this.contains(target) || 
                                   this.shadowRoot?.contains(target);
      
      if (!isClickInsideComponent) {
        this.dropdownController.close();
        this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.BLUR, {
          bubbles: true,
          composed: true,
        }));
      }
    }
  }

  private handleDropdownClick(e: Event): void {
    // Prevent dropdown from closing when clicking inside
    e.stopPropagation();
  }

  private handleOkClick(): void {
    // Close the dropdown and emit final change event
    this.dropdownController.close();
    const selectedTime = this.selectionController.getSelectedTime();
    
    if (selectedTime) {
      this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.TIME_CHANGE, {
        bubbles: true,
        composed: true,
        detail: { value: this.value, time: selectedTime }
      }));
    }
    
    this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.BLUR, {
      bubbles: true,
      composed: true,
    }));
  }

  private handleInputBlur(): void {
    // Only close dropdown if clicking outside the component
    setTimeout(() => {
      const activeElement = document.activeElement;
      const isWithinComponent = this.contains(activeElement) || 
                              this.shadowRoot?.contains(activeElement);
      
      if (!isWithinComponent) {
        this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.BLUR, {
          bubbles: true,
          composed: true,
        }));
      }
    }, 150);
  }

  private handleInputClick(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.disabled) {
      // Only open if closed - don't close when clicking input
      if (!this.dropdownController.isOpen) {
        this.dropdownController.open();
        // Scroll to selected items when dropdown opens
        setTimeout(() => {
          this.scrollToSelectedTime();
        }, 50);
        this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.FOCUS, {
          bubbles: true,
          composed: true,
        }));
      }
    }
  }

  private handleInputChange(e: CustomEvent): void {
    if (this.disabled) return;
    
    const inputValue = e.detail?.value || '';
    this.inputValue = inputValue;
    
    // Parse the input value and update the time selection
    const parsedTime = this.formattingController.parseInputValue(inputValue);
    if (parsedTime) {
      // Validate the parsed time
      if (this.validateTime(parsedTime)) {
        this.selectionController.selectTime(parsedTime);
        this.value = this.formattingController.formatForInput(parsedTime);
        this.state = TimePickerState.Default;
        
        // Scroll to the newly selected time if dropdown is open
        if (this.dropdownController.isOpen) {
          setTimeout(() => {
            this.scrollToSelectedTime();
          }, 10);
        }
        
        // Emit change event
        this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.TIME_CHANGE, {
          bubbles: true,
          composed: true,
          detail: { value: this.value, time: parsedTime }
        }));
      } else {
        // Invalid time - show error state but don't clear the input
        this.state = TimePickerState.Error;
      }
    } else if (inputValue === '') {
      // Empty input - clear the selection
      this.selectionController.clearSelection();
      this.value = '';
      this.state = TimePickerState.Default;
      
      this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.TIME_CHANGE, {
        bubbles: true,
        composed: true,
        detail: { value: '', time: null }
      }));
    } else {
      // Invalid format - show error state
      this.state = TimePickerState.Error;
    }
    
    // Request update to re-render with new state
    this.requestUpdate();
  }

  private handleHourSelect(hour: number, format: TimeFormat): void {
    const selectedTime = this.selectionController.getSelectedTime() || TimeUtils.getCurrentTime();
    let adjustedHour = hour;
    
    if (format === TimeFormat.TwelveHour) {
      const currentPeriod = this.formattingController.getPeriod(selectedTime.hours);
      if (hour === 12) {
        adjustedHour = currentPeriod === TimePeriod.AM ? 0 : 12;
      } else {
        adjustedHour = currentPeriod === TimePeriod.AM ? hour : hour + 12;
      }
    }
    
    const updatedTime = { ...selectedTime, hours: adjustedHour };
    if (this.validateTime(updatedTime)) {
      this.selectionController.selectTime(updatedTime);
      this.updateInputValue();
      // No scrolling when clicking on individual items
    }
  }

  private handleMinuteSelect(minute: number): void {
    const selectedTime = this.selectionController.getSelectedTime() || TimeUtils.getCurrentTime();
    const updatedTime = { ...selectedTime, minutes: minute };
    
    if (this.validateTime(updatedTime)) {
      this.selectionController.selectTime(updatedTime);
      this.updateInputValue();
      // No scrolling when clicking on individual items
    }
  }

  private handleSecondSelect(second: number): void {
    const selectedTime = this.selectionController.getSelectedTime() || TimeUtils.getCurrentTime();
    const updatedTime = { ...selectedTime, seconds: second };
    
    if (this.validateTime(updatedTime)) {
      this.selectionController.selectTime(updatedTime);
      this.updateInputValue();
      // No scrolling when clicking on individual items
    }
  }

  // Utility methods
  private shouldUpdateConstraints(changedProperties: Map<string, any>): boolean {
    return (
      changedProperties.has('minTime') ||
      changedProperties.has('maxTime') ||
      changedProperties.has('disabledTimes') ||
      changedProperties.has('enabledTimes')
    );
  }

  private updateConstraints(): void {
    const constraints: TimeConstraints = {
      minTime: this.minTime,
      maxTime: this.maxTime,
      disabledTimes: this.disabledTimes || [],
      enabledTimes: this.enabledTimes,
    };

    this.validationController.setConstraints(constraints);
  }

  private setTimeFromValue(value: string): void {
    if (this.selectionController.setTimeFromString(value)) {
      this.inputValue = value;
      this.requestUpdate();
      // Scroll to the time when setting from value (if dropdown is open)
      if (this.dropdownController.isOpen) {
        setTimeout(() => {
          this.scrollToSelectedTime();
        }, 50);
      }
    }
  }

  private updateInputValue(): void {
    const selectedTime = this.selectionController.getSelectedTime();
    if (selectedTime) {
      const formattedValue = this.formattingController.formatForDisplay(selectedTime);
      this.inputValue = formattedValue;
      this.value = formattedValue;
      
      this.dispatchEvent(new CustomEvent(TIME_PICKER_EVENTS.TIME_CHANGE, {
        detail: { value: formattedValue, time: selectedTime },
        bubbles: true,
        composed: true,
      }));
    }
  }

  getConfig(): TimePickerConfig {
    return {
      format: this.format,
      showSeconds: this.showSeconds,
      step: {
        hours: TimeStep.One,
        minutes: TimeStep.One,
        seconds: TimeStep.One,
      },
      use12HourClock: this.format === TimeFormat.TwelveHour,
      minuteInterval: 1,
      secondInterval: 1,
    };
  }

  // TimePickerHost interface implementation
  getCurrentTime(): TimeValue {
    return this.selectionController.getSelectedTime() || EMPTY_TIME_VALUE;
  }

  setTime(time: TimeValue): void {
    this.selectionController.selectTime(time);
    this.updateInputValue();
    // Scroll to the newly selected time if dropdown is open
    if (this.dropdownController.isOpen) {
      setTimeout(() => {
        this.scrollToSelectedTime();
      }, 10);
    }
  }

  formatTime(time: TimeValue): string {
    return this.formattingController.formatForDisplay(time);
  }

  /**
   * Get appropriate placeholder text based on format
   */
  private getFormatPlaceholder(): string {
    if (this.format === TimeFormat.TwelveHour) {
      return this.showSeconds ? 'HH:MM:SS AM/PM' : 'HH:MM AM/PM';
    } else {
      return this.showSeconds ? 'HH:MM:SS' : 'HH:MM';
    }
  }

  parseTime(timeString: string): TimeValue | null {
    return this.formattingController.parseInputValue(timeString);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-timepicker': NrTimePickerElement;
  }
}
