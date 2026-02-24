import { ReactiveController, ReactiveControllerHost } from 'lit';
import { DropdownController, DropdownHost, DropdownPosition, DropdownSpace } from './dropdown.interface.js';
import {
  calculateFixedPosition,
  applyFixedPosition,
  applyHeightConstraints,
  resetDropdownPosition,
  isTriggerInViewport
} from '../utils/dropdown-positioning.js';

/**
 * Configuration options for the shared dropdown controller
 */
export interface DropdownControllerOptions {
  /** Gap between trigger and dropdown in pixels (default: 4) */
  offset?: number;
  /** CSS variable for z-index (default: '9999') */
  zIndex?: string;
  /** Margin from viewport edges in pixels (default: 8) */
  viewportMargin?: number;
}

/**
 * Shared dropdown controller for components that need dropdown functionality
 * Uses fixed positioning to prevent clipping by overflow containers
 */
export class SharedDropdownController implements ReactiveController, DropdownController {
  private _host: ReactiveControllerHost & DropdownHost;
  private _isOpen: boolean = false;
  private _position: DropdownPosition = { top: 0, left: 0, width: 0, placement: 'bottom' };
  private _dropdownElement: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;
  private _options: Required<DropdownControllerOptions>;

  constructor(host: ReactiveControllerHost & DropdownHost, options: DropdownControllerOptions = {}) {
    this._host = host;
    this._host.addController(this);
    this._options = {
      offset: options.offset ?? 4,
      zIndex: options.zIndex ?? '9999',
      viewportMargin: options.viewportMargin ?? 8,
    };
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
      const { offset, viewportMargin } = this._options;
      const position = calculateFixedPosition(
        this._triggerElement,
        this._dropdownElement,
        { offset, viewportMargin }
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
        this._dropdownElement = hostElement.shadowRoot.querySelector('.options, .dropdown__panel, .calendar-container');
        this._triggerElement = hostElement.shadowRoot.querySelector('.wrapper, .dropdown__trigger, .datepicker-input');
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

      const { zIndex, viewportMargin } = this._options;

      // Apply fixed positioning using shared utility
      applyFixedPosition(this._dropdownElement, this._position, zIndex);

      // Apply height constraints using shared utility
      applyHeightConstraints(
        this._dropdownElement,
        this._triggerElement,
        this._position.placement,
        { viewportMargin }
      );

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
   * Handle errors with fallback
   */
  private handleError(error: Error, context: string): void {
    console.warn(`SharedDropdownController [${context}]:`, error);
  }
}
