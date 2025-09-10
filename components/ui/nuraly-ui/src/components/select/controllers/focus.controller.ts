import { FocusController } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';
import { SelectOption } from '../select.types.js';

/**
 * Focus controller manages focus states and focus-related interactions
 */
export class SelectFocusController extends BaseSelectController implements FocusController {
  private _focusedIndex: number = -1;
  private _hasFocus: boolean = false;

  /**
   * Get currently focused option index
   */
  get focusedIndex(): number {
    return this._focusedIndex;
  }

  /**
   * Get currently focused option
   */
  getFocusedOption(): SelectOption | undefined {
    if (this._focusedIndex >= 0 && this._focusedIndex < this.host.options.length) {
      return this.host.options[this._focusedIndex];
    }
    return undefined;
  }

  /**
   * Check if component has focus
   */
  get hasFocus(): boolean {
    return this._hasFocus;
  }

  /**
   * Set focused option by index
   */
  setFocusedOption(index: number): void {
    try {
      if (index >= 0 && index < this.host.options.length) {
        this._focusedIndex = index;
        this.requestUpdate();
        
        this.dispatchEvent(
          new CustomEvent('nr-focus-change', {
            detail: {
              focusedIndex: index,
              focusedOption: this.getFocusedOption(),
            },
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'setFocusedOption');
    }
  }

  /**
   * Focus the select component
   */
  focus(): void {
    try {
      const hostElement = this._host as any;
      const focusableElement = hostElement.shadowRoot?.querySelector('.wrapper');
      
      if (focusableElement) {
        focusableElement.focus();
        this._hasFocus = true;
        this.requestUpdate();

        this.dispatchEvent(
          new CustomEvent('nr-focus', {
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'focus');
    }
  }

  /**
   * Blur the select component
   */
  blur(): void {
    try {
      const hostElement = this._host as any;
      const focusableElement = hostElement.shadowRoot?.querySelector('.wrapper');
      
      if (focusableElement) {
        focusableElement.blur();
      }
      
      this._hasFocus = false;
      this._focusedIndex = -1;
      this.requestUpdate();

      this.dispatchEvent(
        new CustomEvent('nr-blur', {
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'blur');
    }
  }

  /**
   * Focus next option
   */
  focusNext(): void {
    try {
      const nextIndex = this.getNextFocusableIndex(this._focusedIndex);
      if (nextIndex !== -1) {
        this.setFocusedOption(nextIndex);
      }
    } catch (error) {
      this.handleError(error as Error, 'focusNext');
    }
  }

  /**
   * Focus previous option
   */
  focusPrevious(): void {
    try {
      const previousIndex = this.getPreviousFocusableIndex(this._focusedIndex);
      if (previousIndex !== -1) {
        this.setFocusedOption(previousIndex);
      }
    } catch (error) {
      this.handleError(error as Error, 'focusPrevious');
    }
  }

  /**
   * Focus first option
   */
  focusFirst(): void {
    try {
      const firstIndex = this.getNextFocusableIndex(-1);
      if (firstIndex !== -1) {
        this.setFocusedOption(firstIndex);
      }
    } catch (error) {
      this.handleError(error as Error, 'focusFirst');
    }
  }

  /**
   * Focus last option
   */
  focusLast(): void {
    try {
      const lastIndex = this.getPreviousFocusableIndex(this.host.options.length);
      if (lastIndex !== -1) {
        this.setFocusedOption(lastIndex);
      }
    } catch (error) {
      this.handleError(error as Error, 'focusLast');
    }
  }

  /**
   * Clear focus
   */
  clearFocus(): void {
    this._focusedIndex = -1;
    this._hasFocus = false;
    this.requestUpdate();
  }

  /**
   * Handle focus event from host
   */
  handleFocus(): void {
    this._hasFocus = true;
    this.requestUpdate();
  }

  /**
   * Handle blur event from host
   */
  handleBlur(): void {
    this._hasFocus = false;
    this._focusedIndex = -1;
    this.requestUpdate();
  }

  /**
   * Get next focusable option index
   */
  private getNextFocusableIndex(currentIndex: number): number {
    const options = this.host.options;
    
    for (let i = currentIndex + 1; i < options.length; i++) {
      if (!options[i].disabled) {
        return i;
      }
    }
    
    // Wrap around to beginning
    for (let i = 0; i <= currentIndex; i++) {
      if (!options[i].disabled) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Get previous focusable option index
   */
  private getPreviousFocusableIndex(currentIndex: number): number {
    const options = this.host.options;
    
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!options[i].disabled) {
        return i;
      }
    }
    
    // Wrap around to end
    for (let i = options.length - 1; i >= currentIndex; i--) {
      if (!options[i].disabled) {
        return i;
      }
    }
    
    return -1;
  }

  /**
   * Find option index by value
   */
  findOptionIndex(value: string): number {
    return this.host.options.findIndex(option => option.value === value);
  }

  /**
   * Focus option by value
   */
  focusOptionByValue(value: string): void {
    const index = this.findOptionIndex(value);
    if (index !== -1) {
      this.setFocusedOption(index);
    }
  }
}
