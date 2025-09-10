import { DropdownController, DropdownPosition, DropdownSpace } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';

/**
 * Dropdown controller manages dropdown positioning, visibility, and interactions
 */
export class SelectDropdownController extends BaseSelectController implements DropdownController {
  private _isOpen: boolean = false;
  private _position: DropdownPosition = { top: 0, left: 0, width: 0, placement: 'bottom' };
  private _dropdownElement: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;

  /**
   * Check if dropdown is open
   */
  get isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * Get current dropdown position
   */
  get position(): DropdownPosition {
    return { ...this._position };
  }

  /**
   * Open the dropdown
   */
  open(): void {
    try {
      if (!this._isOpen) {
        this._isOpen = true;
        (this.host as any).show = true;
        this.requestUpdate();
        
        // Always refresh elements before calculating position
        this.findElements();
        
        // Calculate position after DOM update
        setTimeout(() => {
          this.calculatePosition();
        }, 10);

        // Notify host to setup event listeners
        if (this.host && typeof (this.host as any).setupEventListeners === 'function') {
          setTimeout(() => {
            (this.host as any).setupEventListeners();
          }, 50);
        }

        // Focus search input if searchable
        this.focusSearchInput();

        this.dispatchEvent(
          new CustomEvent('nr-dropdown-open', {
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'open');
    }
  }

  /**
   * Close the dropdown
   */
  close(): void {
    try {
      if (this._isOpen) {
        this._isOpen = false;
        (this.host as any).show = false;
        this.resetPosition();
        this.requestUpdate();

        // Notify host to remove event listeners
        if (this.host && typeof (this.host as any).removeEventListeners === 'function') {
          (this.host as any).removeEventListeners();
        }

        this.dispatchEvent(
          new CustomEvent('nr-dropdown-close', {
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'close');
    }
  }

  /**
   * Toggle dropdown visibility
   */
  toggle(): void {
    if (this._isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Focus the search input if searchable is enabled
   */
  private focusSearchInput(): void {
    try {
      // Check if the host has searchable enabled
      const host = this.host as any;
      if (host && host.searchable) {
        // Wait for the DOM to update and the input to be rendered
        setTimeout(() => {
          const searchInput = host.shadowRoot?.querySelector('.search-input') as any;
          if (searchInput && typeof searchInput.focus === 'function') {
            searchInput.focus();
          }
        }, 100); // Slightly longer delay to ensure the input is fully rendered
      }
    } catch (error) {
      // Silently handle any focus errors to avoid breaking the dropdown
      console.warn('Failed to focus search input:', error);
    }
  }

  /**
   * Calculate optimal dropdown placement
   */
  calculatePosition(): void {
    try {
      if (!this._dropdownElement || !this._triggerElement) {
        this.findElements();
      }

      if (!this._dropdownElement || !this._triggerElement) {
          return;
      }

      const triggerRect = this._triggerElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      // Calculate available space for determining placement
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Determine optimal placement (we'll use a default height for calculation)
      const estimatedDropdownHeight = 200; // Reasonable default
      const placement = this.determineOptimalPlacement(estimatedDropdownHeight, spaceAbove, spaceBelow);
      
      // Store the placement for applyPosition to use
      this._position = {
        left: 0, // Not used with absolute positioning
        width: 0, // Not used with absolute positioning  
        placement,
        top: 0 // Not used with absolute positioning
      };

      this.applyPosition();

    } catch (error) {
      this.handleError(error as Error, 'calculatePosition');
    }
  }

  /**
   * Reset dropdown position
   */
  resetPosition(): void {
    try {
      if (this._dropdownElement) {
        this._dropdownElement.style.removeProperty('position');
        this._dropdownElement.style.removeProperty('top');
        this._dropdownElement.style.removeProperty('left');
        this._dropdownElement.style.removeProperty('width');
        this._dropdownElement.style.removeProperty('max-height');
        this._dropdownElement.style.removeProperty('min-height');
        this._dropdownElement.style.removeProperty('height');
        this._dropdownElement.style.removeProperty('overflow-y');
        this._dropdownElement.style.removeProperty('transform');
        this._dropdownElement.style.removeProperty('display');
        this._dropdownElement.style.removeProperty('opacity');
        this._dropdownElement.style.removeProperty('visibility');
        this._dropdownElement.style.removeProperty('z-index');
        this._dropdownElement.classList.remove('placement-top', 'placement-bottom');
      }
    } catch (error) {
      this.handleError(error as Error, 'resetPosition');
    }
  }

  /**
   * Set dropdown and trigger element references
   */
  setElements(dropdownElement: HTMLElement, triggerElement: HTMLElement): void {
    this._dropdownElement = dropdownElement;
    this._triggerElement = triggerElement;
  }

  /**
   * Find dropdown and trigger elements
   */
  private findElements(): void {
    try {
      const hostElement = this._host as any;
      
      // First priority: use the elements that were explicitly set via setElements()
      // This ensures each instance gets its own elements
      if (hostElement.optionsElement && hostElement.wrapper) {
        this._dropdownElement = hostElement.optionsElement;
        this._triggerElement = hostElement.wrapper;
        return;
      }
      
      // Fallback: try to find from shadow DOM (but this can be problematic with multiple instances)
      if (hostElement.shadowRoot) {
        this._dropdownElement = hostElement.shadowRoot.querySelector('.options');
        this._triggerElement = hostElement.shadowRoot.querySelector('.wrapper');
      }
      
    } catch (error) {
      this.handleError(error as Error, 'findElements');
    }
  }

  /**
   * Determine optimal dropdown placement
   */
  private determineOptimalPlacement(
    dropdownHeight: number, 
    spaceAbove: number, 
    spaceBelow: number
  ): 'top' | 'bottom' {
    // If there's enough space below, use bottom
    if (spaceBelow >= dropdownHeight) {
      return 'bottom';
    }
    
    // If there's enough space above, use top
    if (spaceAbove >= dropdownHeight) {
      return 'top';
    }
    
    // If neither has enough space, choose the side with more space
    // This ensures the dropdown appears even in constrained spaces
    return spaceAbove > spaceBelow ? 'top' : 'bottom';
  }

  /**
   * Apply calculated position to dropdown element
   */
  private applyPosition(): void {
    try {
      if (!this._dropdownElement || !this._triggerElement) {
        return;
      }

      const { placement } = this._position;
      
      // Get the exact wrapper width including borders
      const triggerBounds = this._triggerElement.getBoundingClientRect();
      const wrapperWidth = triggerBounds.width;
      
      // Use absolute positioning relative to the trigger element (combobox)
      this._dropdownElement.style.position = 'absolute';
      this._dropdownElement.style.left = '0';
      this._dropdownElement.style.right = 'auto';
      this._dropdownElement.style.width = `${wrapperWidth}px`; // Exact wrapper width in pixels
      this._dropdownElement.style.zIndex = '1000';
      this._dropdownElement.style.height = 'auto';
      this._dropdownElement.style.maxHeight = 'none';
      this._dropdownElement.style.minHeight = 'auto';
      
      // Set position based on placement
      if (placement === 'bottom') {
        this._dropdownElement.style.top = '100%';
        this._dropdownElement.style.bottom = 'auto';
      } else {
        this._dropdownElement.style.top = 'auto';
        this._dropdownElement.style.bottom = '100%';
      }
      
      // Force a layout to get the natural content height
      const naturalHeight = this._dropdownElement.scrollHeight;
      
      // Now calculate available space for constraining
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      let availableSpace: number;
      
      // Calculate available space using bounds we already calculated
      if (placement === 'bottom') {
        // For bottom placement, available space is from trigger bottom to viewport bottom
        availableSpace = viewportHeight - triggerBounds.bottom - 10;  // 10px margin from bottom
      } else {
        // For top placement, available space is from viewport top to trigger top
        availableSpace = triggerBounds.top - 10; // 10px margin from top
      }
      
      // Apply the calculated constraints
      if (naturalHeight > availableSpace) {
        // Content is larger than available space, so constrain and add scrolling
        this._dropdownElement.style.maxHeight = `${availableSpace}px`;
        this._dropdownElement.style.overflowY = 'auto';
      } else {
        // Content fits, so use natural height with auto overflow for consistency
        this._dropdownElement.style.maxHeight = `${naturalHeight}px`;
        this._dropdownElement.style.overflowY = 'auto';
      }
      
      // Add placement class for styling
      this._dropdownElement.classList.remove('placement-top', 'placement-bottom');
      this._dropdownElement.classList.add(`placement-${placement}`);
      
      // Position and constraints applied successfully

    } catch (error) {
      this.handleError(error as Error, 'applyPosition');
    }
  }

  /**
   * Calculate available space around trigger
   */
  getAvailableSpace(): DropdownSpace {
    if (!this._triggerElement) {
      return { above: 0, below: 0, left: 0, right: 0 };
    }

    const triggerRect = this._triggerElement.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const viewportWidth = window.visualViewport?.width || window.innerWidth;

    return {
      above: triggerRect.top,
      below: viewportHeight - triggerRect.bottom,
      left: triggerRect.left,
      right: viewportWidth - triggerRect.right,
    };
  }

  /**
   * Handle window resize to recalculate position
   */
  private handleResize = (): void => {
    if (this._isOpen) {
      this.calculatePosition();
    }
  };

  /**
   * Handle scroll to manage dropdown visibility
   */
  private handleScroll = (): void => {
    if (this._isOpen && this._triggerElement) {
      const triggerRect = this._triggerElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      
      // Close dropdown if trigger is scrolled out of view
      if (triggerRect.bottom < 0 || triggerRect.top > viewportHeight) {
        this.close();
      }
      // With absolute positioning, the dropdown moves with the trigger automatically
      // so no need to recalculate position on scroll
    }
  };

  /**
   * Host connected lifecycle
   */
  override hostConnected(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll, true);
  }

  /**
   * Host disconnected lifecycle
   */
  override hostDisconnected(): void {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll, true);
  }
}
