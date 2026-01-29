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
   * Calculate optimal dropdown placement using fixed positioning
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
      const dropdownRect = this._dropdownElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const viewportWidth = window.visualViewport?.width || window.innerWidth;

      // Calculate available space for determining placement
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Use actual dropdown height if available, otherwise estimate
      const estimatedDropdownHeight = dropdownRect.height || 200;
      const placement = this.determineOptimalPlacement(estimatedDropdownHeight, spaceAbove, spaceBelow);

      // Calculate fixed position based on trigger's viewport position
      const offset = 4; // Gap between trigger and dropdown
      let top: number;

      if (placement === 'bottom') {
        top = triggerRect.bottom + offset;
      } else {
        top = triggerRect.top - estimatedDropdownHeight - offset;
      }

      // Horizontal position - align to trigger's left edge
      let left = triggerRect.left;

      // Ensure dropdown stays within viewport bounds
      const dropdownWidth = triggerRect.width; // Match trigger width by default
      left = Math.max(8, Math.min(left, viewportWidth - dropdownWidth - 8));
      top = Math.max(8, Math.min(top, viewportHeight - estimatedDropdownHeight - 8));

      // Store the calculated position
      this._position = {
        left,
        width: triggerRect.width,
        placement,
        top
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
        this._dropdownElement.style.removeProperty('right');
        this._dropdownElement.style.removeProperty('bottom');
        this._dropdownElement.style.removeProperty('width');
        this._dropdownElement.style.removeProperty('min-width');

        // Only remove max-height if host doesn't have a custom maxHeight
        const customMaxHeight = (this.host as any).maxHeight;
        if (!customMaxHeight) {
          this._dropdownElement.style.removeProperty('max-height');
        }

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
   * Apply calculated position to dropdown element using fixed positioning
   */
  private applyPosition(): void {
    try {
      if (!this._dropdownElement || !this._triggerElement) {
        return;
      }

      // Check if host has a custom maxHeight set
      const hostMaxHeight = (this.host as any).maxHeight;

      // Check if CSS max-height is set to auto via CSS custom property
      const computedStyle = getComputedStyle(this._dropdownElement);
      const cssMaxHeight = computedStyle.getPropertyValue('--nuraly-select-local-dropdown-max-height')?.trim();
      const isAutoHeight = cssMaxHeight === 'auto' || (!hostMaxHeight && cssMaxHeight === 'auto');

      const { placement, top, left, width } = this._position;

      // Use fixed positioning to escape overflow containers
      this._dropdownElement.style.position = 'fixed';
      this._dropdownElement.style.top = `${top}px`;
      this._dropdownElement.style.left = `${left}px`;
      this._dropdownElement.style.removeProperty('right');
      this._dropdownElement.style.removeProperty('bottom');

      // Set width to match trigger width
      this._dropdownElement.style.minWidth = `${width}px`;
      this._dropdownElement.style.removeProperty('width');
      this._dropdownElement.style.zIndex = 'var(--nuraly-select-dropdown-z-index, 9999)';
      this._dropdownElement.style.height = 'auto';

      // Only set maxHeight to 'none' if host doesn't have a custom maxHeight and we're not using auto height
      if (!hostMaxHeight && !isAutoHeight) {
        this._dropdownElement.style.maxHeight = 'none';
      }

      this._dropdownElement.style.minHeight = 'auto';

      // Force a layout to get the natural content height
      const naturalHeight = this._dropdownElement.scrollHeight;

      // Calculate available space for constraining
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const triggerBounds = this._triggerElement.getBoundingClientRect();
      let availableSpace: number;

      if (placement === 'bottom') {
        // For bottom placement, available space is from trigger bottom to viewport bottom
        availableSpace = viewportHeight - triggerBounds.bottom - 10; // 10px margin from bottom
      } else {
        // For top placement, available space is from viewport top to trigger top
        availableSpace = triggerBounds.top - 10; // 10px margin from top
      }

      if (hostMaxHeight) {
        // Use the host's custom maxHeight and enable scrolling
        this._dropdownElement.style.maxHeight = hostMaxHeight;
        this._dropdownElement.style.overflowY = 'auto';
      } else if (isAutoHeight) {
        // If max-height is set to auto, don't constrain the dropdown
        this._dropdownElement.style.removeProperty('max-height');
        this._dropdownElement.style.overflowY = 'visible';
      } else {
        // Apply the calculated constraints based on available space
        if (naturalHeight > availableSpace) {
          // Content is larger than available space, so constrain and add scrolling
          this._dropdownElement.style.maxHeight = `${availableSpace}px`;
          this._dropdownElement.style.overflowY = 'auto';
        } else {
          // Content fits, so use natural height with auto overflow for consistency
          this._dropdownElement.style.maxHeight = `${naturalHeight}px`;
          this._dropdownElement.style.overflowY = 'auto';
        }
      }

      // Add placement class for styling
      this._dropdownElement.classList.remove('placement-top', 'placement-bottom');
      this._dropdownElement.classList.add(`placement-${placement}`);

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
   * Handle scroll to manage dropdown visibility and position
   */
  private handleScroll = (): void => {
    if (this._isOpen && this._triggerElement) {
      const triggerRect = this._triggerElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      // Close dropdown if trigger is scrolled out of view
      if (triggerRect.bottom < 0 || triggerRect.top > viewportHeight) {
        this.close();
      } else {
        // With fixed positioning, we need to recalculate position on scroll
        // to keep the dropdown aligned with the trigger
        this.calculatePosition();
      }
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
