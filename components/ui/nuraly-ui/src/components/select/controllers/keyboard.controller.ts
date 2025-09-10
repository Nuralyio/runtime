import { KeyboardController, SelectFocusEventDetail } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';
import { SelectSelectionController } from './selection.controller.js';
import { SelectDropdownController } from './dropdown.controller.js';

/**
 * Keyboard controller handles keyboard navigation and interactions
 */
export class SelectKeyboardController extends BaseSelectController implements KeyboardController {
  private _focusedIndex: number = -1;
  private _hasKeyboardNavigated: boolean = false;

  constructor(
    host: any,
    private selectionController: SelectSelectionController,
    private dropdownController: SelectDropdownController
  ) {
    super(host);
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(event: KeyboardEvent): void {
    try {
      const isSearchInputFocused = this.isSearchInputFocused();
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (this.dropdownController.isOpen) {
            this.navigateNext();
          } else {
            this.openDropdown();
          }
          break;

        case 'ArrowUp':
          event.preventDefault();
          if (this.dropdownController.isOpen) {
            this.navigatePrevious();
          } else {
            this.openDropdown();
          }
          break;

        case 'Enter':
          if (this.dropdownController.isOpen) {
            // If search input is focused and there's a focused option, select it
            if (isSearchInputFocused && this._focusedIndex >= 0) {
              event.preventDefault();
              this.selectFocused();
            } else if (!isSearchInputFocused) {
              // Normal option selection when not in search input
              event.preventDefault();
              this.selectFocused();
            }
            // If search input is focused and no option is selected, let the input handle Enter
          } else {
            event.preventDefault();
            this.openDropdown();
          }
          break;

        case ' ':
          // Only handle space for non-search scenarios to allow typing in search
          if (!isSearchInputFocused) {
            event.preventDefault();
            if (this.dropdownController.isOpen) {
              this.selectFocused();
            } else {
              this.openDropdown();
            }
          }
          break;

        case 'Escape':
          event.preventDefault();
          this.closeDropdown();
          break;

        case 'Tab':
          this.closeDropdown();
          break;

        case 'Home':
          if (this.dropdownController.isOpen) {
            event.preventDefault();
            this.setFocusedIndex(0);
          }
          break;

        case 'End':
          if (this.dropdownController.isOpen) {
            event.preventDefault();
            this.setFocusedIndex(this.host.options.length - 1);
          }
          break;

        default:
          // Handle alphanumeric keys for quick selection
          if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
            this.handleAlphanumericKey(event.key.toLowerCase());
          }
          break;
      }
    } catch (error) {
      this.handleError(error as Error, 'handleKeyDown');
    }
  }

  /**
   * Navigate to next option
   */
  navigateNext(): void {
    try {
      const options = this.getNavigableOptions();
      if (options.length === 0) return;

      // If search input is focused, reset and start from first option
      if (this.isSearchInputFocused()) {
        // Check if this is the first navigation from search (no previous keyboard focus)
        if (this._focusedIndex < 0 || !this._hasKeyboardNavigated) {
          this._hasKeyboardNavigated = true;
          this.setFocusedIndex(0);
          return;
        }
      }

      let nextIndex = this._focusedIndex + 1;
      if (nextIndex >= options.length) {
        nextIndex = 0; // Wrap to first option
      }

      this.setFocusedIndex(nextIndex);
    } catch (error) {
      this.handleError(error as Error, 'navigateNext');
    }
  }

  /**
   * Navigate to previous option
   */
  navigatePrevious(): void {
    try {
      const options = this.getNavigableOptions();
      if (options.length === 0) return;

      // If search input is focused, reset and start from last option
      if (this.isSearchInputFocused()) {
        // Check if this is the first navigation from search (no previous keyboard focus)
        if (this._focusedIndex < 0 || !this._hasKeyboardNavigated) {
          this._hasKeyboardNavigated = true;
          this.setFocusedIndex(options.length - 1);
          return;
        }
      }

      let previousIndex = this._focusedIndex - 1;
      if (previousIndex < 0) {
        previousIndex = options.length - 1; // Wrap to last option
      }

      this.setFocusedIndex(previousIndex);
    } catch (error) {
      this.handleError(error as Error, 'navigatePrevious');
    }
  }

  /**
   * Select the currently focused option
   */
  selectFocused(): void {
    try {
      const options = this.getNavigableOptions();
      const focusedOption = options[this._focusedIndex];
      
      if (focusedOption && !this.selectionController.isOptionDisabled(focusedOption)) {
        this.selectionController.selectOption(focusedOption);
        
        // Close dropdown for single selection
        if (!this.host.multiple) {
          this.closeDropdown();
        }
      }
    } catch (error) {
      this.handleError(error as Error, 'selectFocused');
    }
  }

  /**
   * Open dropdown
   */
  openDropdown(): void {
    try {
      this.dropdownController.open();
      
      // Reset keyboard navigation flag when dropdown opens
      this._hasKeyboardNavigated = false;
      
      // Don't set initial focus - let keyboard navigation handle it
      this._focusedIndex = -1;
    } catch (error) {
      this.handleError(error as Error, 'openDropdown');
    }
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    try {
      this.dropdownController.close();
      this._focusedIndex = -1;
      this._hasKeyboardNavigated = false;
    } catch (error) {
      this.handleError(error as Error, 'closeDropdown');
    }
  }

  /**
   * Set focused option index
   */
  setFocusedIndex(index: number): void {
    try {
      const options = this.getNavigableOptions();
      if (index >= 0 && index < options.length) {
        this._focusedIndex = index;
        this.dispatchFocusEvent(options[index], index);
        this.requestUpdate();
        
        // Scroll the focused option into view
        this.scrollToFocusedOption(index);
      }
    } catch (error) {
      this.handleError(error as Error, 'setFocusedIndex');
    }
  }

  /**
   * Scroll the focused option into view
   */
  private scrollToFocusedOption(index: number): void {
    try {
      const host = this.host as any;
      const dropdownElement = host.shadowRoot?.querySelector('.options');
      
      if (!dropdownElement) {
        return;
      }

      // Wait for the DOM to update with the focused class
      setTimeout(() => {
        const focusedOption = dropdownElement.querySelector('.option.focused');
        
        if (focusedOption) {
          // Use scrollIntoView with smooth behavior
          focusedOption.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        } else {
          // Fallback: scroll based on option index and estimated height
          const optionHeight = 40; // Estimated option height in pixels
          const containerHeight = dropdownElement.clientHeight;
          const scrollTop = dropdownElement.scrollTop;
          
          const optionTop = index * optionHeight;
          const optionBottom = optionTop + optionHeight;
          const visibleTop = scrollTop;
          const visibleBottom = scrollTop + containerHeight;
          
          if (optionTop < visibleTop) {
            // Option is above visible area, scroll up
            dropdownElement.scrollTo({
              top: optionTop,
              behavior: 'smooth'
            });
          } else if (optionBottom > visibleBottom) {
            // Option is below visible area, scroll down
            dropdownElement.scrollTo({
              top: optionBottom - containerHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 10); // Small delay to ensure DOM updates
    } catch (error) {
      // Silently handle scroll errors to avoid breaking navigation
      console.warn('Failed to scroll to focused option:', error);
    }
  }

  /**
   * Get focused option index
   */
  get focusedIndex(): number {
    return this._focusedIndex;
  }

  /**
   * Get focused option
   */
  get focusedOption(): any {
    const options = this.getNavigableOptions();
    return options[this._focusedIndex];
  }

  /**
   * Handle alphanumeric key press for quick selection
   */
  private handleAlphanumericKey(key: string): void {
    try {
      const options = this.getNavigableOptions();
      const startIndex = this._focusedIndex + 1;
      
      // Search from current position forward
      for (let i = 0; i < options.length; i++) {
        const index = (startIndex + i) % options.length;
        const option = options[index];
        
        if (option.label.toLowerCase().startsWith(key)) {
          this.setFocusedIndex(index);
          if (!this.dropdownController.isOpen) {
            this.openDropdown();
          }
          break;
        }
      }
    } catch (error) {
      this.handleError(error as Error, 'handleAlphanumericKey');
    }
  }

  /**
   * Get options that can be navigated (not disabled)
   */
  private getNavigableOptions(): any[] {
    const host = this.host as any;
    if (!host.options || !Array.isArray(host.options)) {
      return [];
    }
    
    // Use filtered options if search is active
    let optionsToUse = host.options;
    if (host.searchable && host.searchQuery && typeof host.getFilteredOptions === 'function') {
      optionsToUse = host.getFilteredOptions();
    }
    
    return optionsToUse.filter((option: any) => !option.disabled);
  }

  /**
   * Dispatch focus event
   */
  private dispatchFocusEvent(option: any, index: number): void {
    const detail: SelectFocusEventDetail = {
      focusedOption: option,
      focusedIndex: index,
    };

    this.dispatchEvent(
      new CustomEvent('nr-select-focus', {
        detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Check if the search input currently has focus
   */
  private isSearchInputFocused(): boolean {
    try {
      const host = this.host as any;
      if (!host.searchable) {
        return false;
      }
      
      const searchInput = host.shadowRoot?.querySelector('.search-input');
      if (!searchInput) {
        return false;
      }
      
      // Check if the search input or its internal input element has focus
      return document.activeElement === searchInput || 
             (searchInput.shadowRoot && 
              searchInput.shadowRoot.querySelector('input') === searchInput.shadowRoot.activeElement) ||
             searchInput.contains(document.activeElement);
    } catch (error) {
      return false;
    }
  }



  /**
   * Reset focused index when dropdown closes
   */
  override hostUpdated(): void {
    if (!this.dropdownController.isOpen && this._focusedIndex !== -1) {
      this._focusedIndex = -1;
    }
  }
}
