import { DropdownController, DropdownPosition, DropdownSpace } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';
import {
  calculateFixedPosition,
  applyFixedPosition,
  applyHeightConstraints,
  resetDropdownPosition,
  isTriggerInViewport
} from '../../../shared/utils/dropdown-positioning.js';

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

      // Use shared positioning utility
      const position = calculateFixedPosition(
        this._triggerElement,
        this._dropdownElement,
        { offset: 4, viewportMargin: 8 }
      );

      // Store the calculated position
      this._position = position;

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
        resetDropdownPosition(this._dropdownElement);

        // Only remove max-height if host doesn't have a custom maxHeight
        const customMaxHeight = (this.host as any).maxHeight;
        if (!customMaxHeight) {
          this._dropdownElement.style.removeProperty('max-height');
        }
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

      // Apply fixed positioning using shared utility
      applyFixedPosition(
        this._dropdownElement,
        this._position,
        'var(--nuraly-select-dropdown-z-index, 9999)'
      );

      // Handle max-height based on configuration
      if (!hostMaxHeight && !isAutoHeight) {
        this._dropdownElement.style.maxHeight = 'none';
      }

      // Apply height constraints using shared utility
      if (hostMaxHeight) {
        applyHeightConstraints(
          this._dropdownElement,
          this._triggerElement,
          this._position.placement,
          { viewportMargin: 10, maxHeight: hostMaxHeight }
        );
      } else if (isAutoHeight) {
        // If max-height is set to auto, don't constrain the dropdown
        this._dropdownElement.style.removeProperty('max-height');
        this._dropdownElement.style.overflowY = 'visible';
      } else {
        applyHeightConstraints(
          this._dropdownElement,
          this._triggerElement,
          this._position.placement,
          { viewportMargin: 10 }
        );
      }

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
      // Close dropdown if trigger is scrolled out of view
      if (!isTriggerInViewport(this._triggerElement)) {
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
