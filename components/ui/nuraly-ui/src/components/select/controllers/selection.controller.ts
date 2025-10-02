import { SelectOption } from '../select.types.js';
import { SelectionController, SelectChangeEventDetail } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';

/**
 * Selection controller manages option selection state and logic
 */
export class SelectSelectionController extends BaseSelectController implements SelectionController {
  private _selectedOptions: SelectOption[] = [];
  private _initialized: boolean = false;

  /**
   * Get currently selected options
   */
  getSelectedOptions(): SelectOption[] {
    return [...this._selectedOptions];
  }

  /**
   * Get single selected option (for single selection mode)
   */
  getSelectedOption(): SelectOption | undefined {
    return this._selectedOptions[0];
  }

  /**
   * Select an option
   */
  selectOption(option: SelectOption): void {
    try {
      if (this.isOptionDisabled(option)) {
        return;
      }

      const isMultiple = this.host.multiple;
      const previousValue = this.getCurrentValue();

      if (isMultiple) {
        // Multiple selection mode
        if (!this.isOptionSelected(option)) {
          this._selectedOptions = [...this._selectedOptions, option];
          this.updateHostValue();
          this.dispatchChangeEvent(previousValue);
        }
      } else {
        // Single selection mode
        if (this.isOptionSelected(option)) {
          // Deselect if already selected
          this._selectedOptions = [];
        } else {
          this._selectedOptions = [option];
        }
        this.updateHostValue();
        this.dispatchChangeEvent(previousValue);
      }

      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'selectOption');
    }
  }

  /**
   * Unselect an option
   */
  unselectOption(option: SelectOption): void {
    try {
      if (this.isOptionSelected(option)) {
        const previousValue = this.getCurrentValue();
        this._selectedOptions = this._selectedOptions.filter(
          selected => selected.value !== option.value
        );
        this.updateHostValue();
        this.dispatchChangeEvent(previousValue);
        this.requestUpdate();
      }
    } catch (error) {
      this.handleError(error as Error, 'unselectOption');
    }
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    try {
      if (this._selectedOptions.length > 0) {
        const previousValue = this.getCurrentValue();
        this._selectedOptions = [];
        this.updateHostValue();
        this.dispatchChangeEvent(previousValue);
        this.requestUpdate();
      }
    } catch (error) {
      this.handleError(error as Error, 'clearSelection');
    }
  }

  /**
   * Check if an option is selected
   */
  isOptionSelected(option: SelectOption): boolean {
    return this._selectedOptions.some(selected => selected.value === option.value);
  }

  /**
   * Check if an option is disabled
   */
  isOptionDisabled(option: SelectOption): boolean {
    return Boolean(option.disabled) || this.host.disabled;
  }

  /**
   * Toggle option selection state
   */
  toggleOption(option: SelectOption): void {
    if (this.isOptionSelected(option)) {
      this.unselectOption(option);
    } else {
      this.selectOption(option);
    }
  }

  /**
   * Initialize selection from host value
   */
  initializeFromValue(): void {
    try {
      // Prevent re-initialization
      if (this._initialized) return;
      
      const value = this.host.value;
      if (!value || (Array.isArray(value) && value.length === 0)) return;

      const values = Array.isArray(value) ? value : [value];
      const selectedOptions = this.host.options.filter(option =>
        values.includes(option.value)
      );

      if (selectedOptions.length > 0) {
        this._selectedOptions = this.host.multiple ? selectedOptions : [selectedOptions[0]];
        // Don't call updateHostValue during initialization to avoid loops
        // The host already has the value, no need to update it
        this.requestUpdate();
      }
      
      this._initialized = true;
    } catch (error) {
      this.handleError(error as Error, 'initializeFromValue');
    }
  }

  /**
   * Update host value property (avoiding infinite loops)
   */
  private updateHostValue(): void {
    const newValue = this.host.multiple 
      ? this._selectedOptions.map(option => option.value)
      : this._selectedOptions[0]?.value || '';
    
    // Only update if the value actually changed to avoid infinite loops
    const currentValue = (this.host as any).value;
    
    let valuesEqual = false;
    if (this.host.multiple) {
      // For arrays, compare length and contents
      const currentArray = Array.isArray(currentValue) ? currentValue : [];
      const newArray = Array.isArray(newValue) ? newValue : [];
      valuesEqual = currentArray.length === newArray.length && 
                   currentArray.every((val, index) => val === newArray[index]);
    } else {
      valuesEqual = currentValue === newValue;
    }
    
    if (!valuesEqual) {
      (this.host as any).value = newValue;
    }
  }

  /**
   * Get current value for change event
   */
  private getCurrentValue(): string | string[] {
    if (this.host.multiple) {
      return this._selectedOptions.map(option => option.value);
    }
    return this._selectedOptions[0]?.value || '';
  }

  /**
   * Dispatch change event
   */
  private dispatchChangeEvent(previousValue: string | string[]): void {
    const detail: SelectChangeEventDetail = {
      value: this.getCurrentValue(),
      selectedOptions: this.getSelectedOptions(),
      previousValue,
    };

    this.dispatchEvent(
      new CustomEvent('nr-change', {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Host update lifecycle
   */
  override hostUpdated(): void {
    // Sync with host's options changes
    this.syncWithHostOptions();
  }

  /**
   * Sync selected options with current host options
   */
  private syncWithHostOptions(): void {
    try {
      // Remove selected options that no longer exist in host options
      this._selectedOptions = this._selectedOptions.filter(selected =>
        this.host.options.some(option => option.value === selected.value)
      );

      // Update selected option references to current host options
      this._selectedOptions = this._selectedOptions.map(selected => {
        const currentOption = this.host.options.find(option => option.value === selected.value);
        return currentOption || selected;
      });

      this.updateHostValue();
    } catch (error) {
      this.handleError(error as Error, 'syncWithHostOptions');
    }
  }
}
