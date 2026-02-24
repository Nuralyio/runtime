import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DropdownController, DropdownHost, DropdownPosition, DropdownSpace } from './dropdown.interface.js';

/**
 * Shared dropdown controller for components that need dropdown functionality
 * Based on the select component's dropdown controller but generalized for reuse
 */
export class SharedDropdownController implements ReactiveController, DropdownController {
  private _host: ReactiveControllerHost & DropdownHost;
  private _isOpen: boolean = false;
  private _position: DropdownPosition = { top: 0, left: 0, width: 0, placement: 'bottom' };
  private _dropdownElement: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;

  constructor(host: ReactiveControllerHost & DropdownHost) {
    this._host = host;
    this._host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll, true);
  }

  hostDisconnected(): void {
    this.close();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll, true);
  }

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
        (this._host as any).show = true;
        this._host.requestUpdate();
        
        // Always refresh elements before calculating position
        this.findElements();
        
        // Calculate position after DOM update
        setTimeout(() => {
          this.calculatePosition();
        }, 0);

        // Notify host to setup event listeners if available
        if (this._host && typeof (this._host as any).setupEventListeners === 'function') {
          setTimeout(() => {
            (this._host as any).setupEventListeners();
          }, 0);
        }

        this._host.dispatchEvent(
          new CustomEvent('dropdown-open', {
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
        (this._host as any).show = false;
        this.resetPosition();
        this._host.requestUpdate();

        // Notify host to remove event listeners if available
        if (this._host && typeof (this._host as any).removeEventListeners === 'function') {
          (this._host as any).removeEventListeners();
        }

        this._host.dispatchEvent(
          new CustomEvent('dropdown-close', {
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

      // Get the actual height of the dropdown element for accurate placement calculation
      let dropdownHeight = 200; // fallback
      if (this._dropdownElement) {
        // Temporarily make it visible to measure height
        const originalDisplay = this._dropdownElement.style.display;
        const originalVisibility = this._dropdownElement.style.visibility;
        const originalPosition = this._dropdownElement.style.position;
        
        this._dropdownElement.style.visibility = 'hidden';
        this._dropdownElement.style.display = 'block';
        this._dropdownElement.style.position = 'absolute';
        
        dropdownHeight = this._dropdownElement.offsetHeight || this._dropdownElement.scrollHeight || 200;
        
        // Restore original styles
        this._dropdownElement.style.display = originalDisplay;
        this._dropdownElement.style.visibility = originalVisibility;
        this._dropdownElement.style.position = originalPosition;
      }
      
      const placement = this.determineOptimalPlacement(dropdownHeight, spaceAbove, spaceBelow);
      
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
      // If elements are already set via setElements(), don't override them
      if (this._dropdownElement && this._triggerElement) {
        return;
      }
      
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
        this._dropdownElement = hostElement.shadowRoot.querySelector('.calendar-container, .month-dropdown, .year-dropdown');
        this._triggerElement = hostElement.shadowRoot.querySelector('.datepicker-input, .toggle-month-view, .toggle-year-view');
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
      console.log(`Applying ${placement} placement to dropdown`);
      if (placement === 'bottom') {
        this._dropdownElement.style.top = '100%';
        this._dropdownElement.style.bottom = 'auto';
        console.log('Applied bottom placement: top=100%, bottom=auto');
      } else {
        this._dropdownElement.style.top = 'auto';
        this._dropdownElement.style.bottom = '100%';
        console.log('Applied top placement: top=auto, bottom=100%');
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
   * Handle errors with fallback
   */
  private handleError(error: Error, context: string): void {
    console.warn(`SharedDropdownController [${context}]:`, error);
  }
}
