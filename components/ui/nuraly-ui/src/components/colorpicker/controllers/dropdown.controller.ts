import { BaseColorPickerController } from './base.controller.js';
import type { DropdownController, DropdownPosition } from '../interfaces/index.js';

/**
 * Dropdown controller manages the colorpicker dropdown positioning, visibility, and interactions
 */
export class ColorPickerDropdownController extends BaseColorPickerController implements DropdownController {
  private _isOpen: boolean = false;
  private _position: DropdownPosition = { top: 0, left: 0, width: 0, placement: 'bottom' };
  private _dropdownElement: HTMLElement | null = null;
  private _triggerElement: HTMLElement | null = null;
  private _scrollHandler: (() => void) | null = null;
  private _resizeHandler: (() => void) | null = null;

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

  override hostConnected(): void {
    this.setupScrollAndResizeListeners();
  }

  override hostDisconnected(): void {
    this.cleanup();
  }

  /**
   * Open the dropdown
   */
  open(): void {
    try {
      if (!this._isOpen && !this.host.disabled) {
        this._isOpen = true;
        this.host.show = true;
        this.requestUpdate();
        
        // Find elements and calculate position after DOM update
        requestAnimationFrame(() => {
          this.findElements();
          
          // Hide initially to prevent flicker
          if (this._dropdownElement) {
            this._dropdownElement.classList.remove('positioned');
          }
          
          // Calculate position and show
          requestAnimationFrame(() => {
            this.calculatePosition();
            
            // Make visible after positioning
            if (this._dropdownElement) {
              this._dropdownElement.classList.add('positioned');
            }
          });
        });

        // Setup event listeners
        if (this.host && typeof this.host.setupEventListeners === 'function') {
          setTimeout(() => {
            this.host.setupEventListeners?.();
          }, 50);
        }

        this.dispatchEvent(
          new CustomEvent('nr-colorpicker-open', {
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
        this.host.show = false;
        this.resetPosition();
        this.requestUpdate();

        // Notify host to remove event listeners
        if (this.host && typeof this.host.removeEventListeners === 'function') {
          this.host.removeEventListeners?.();
        }

        this.dispatchEvent(
          new CustomEvent('nr-colorpicker-close', {
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
   * Find dropdown and trigger elements
   */
  private findElements(): void {
    this._dropdownElement = this.findElement('.dropdown-container');
    this._triggerElement = this.findElement('.color-holder');
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
      const dropdownRect = this._dropdownElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const viewportWidth = window.visualViewport?.width || window.innerWidth;

      // Calculate available space
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const spaceRight = viewportWidth - triggerRect.left;

      // Determine optimal placement
      let top: number;
      let left: number;
      let placement: 'top' | 'bottom' = 'bottom';

      // Vertical positioning
      if (spaceBelow >= dropdownRect.height || spaceBelow > spaceAbove) {
        // Position below
        top = triggerRect.bottom;
        placement = 'bottom';
      } else {
        // Position above
        top = triggerRect.top - dropdownRect.height;
        placement = 'top';
      }

      // Horizontal positioning
      if (spaceRight >= dropdownRect.width) {
        // Align with trigger left edge
        left = triggerRect.left;
      } else {
        // Align to fit within viewport
        left = Math.max(0, viewportWidth - dropdownRect.width);
      }

      this._position = {
        top,
        left,
        width: Math.max(triggerRect.width, dropdownRect.width),
        placement,
      };

      this.applyPosition();
    } catch (error) {
      this.handleError(error as Error, 'calculatePosition');
    }
  }

  /**
   * Apply calculated position to dropdown element
   */
  private applyPosition(): void {
    try {
      if (!this._dropdownElement) return;

      this._dropdownElement.style.position = 'fixed';
      this._dropdownElement.style.top = `${this._position.top}px`;
      this._dropdownElement.style.left = `${this._position.left}px`;
      this._dropdownElement.style.zIndex = '9999';
      
      // Add placement class for styling
      this._dropdownElement.classList.remove('placement-top', 'placement-bottom');
      this._dropdownElement.classList.add(`placement-${this._position.placement}`);
      
      // Ensure positioned class is added for visibility
      this._dropdownElement.classList.add('positioned');
    } catch (error) {
      this.handleError(error as Error, 'applyPosition');
    }
  }

  /**
   * Reset dropdown position
   */
  private resetPosition(): void {
    try {
      if (this._dropdownElement) {
        this._dropdownElement.style.removeProperty('position');
        this._dropdownElement.style.removeProperty('top');
        this._dropdownElement.style.removeProperty('left');
        this._dropdownElement.style.removeProperty('z-index');
        this._dropdownElement.classList.remove('placement-top', 'placement-bottom', 'positioned');
      }
    } catch (error) {
      this.handleError(error as Error, 'resetPosition');
    }
  }

  /**
   * Setup scroll and resize listeners for repositioning
   */
  private setupScrollAndResizeListeners(): void {
    this._scrollHandler = () => {
      if (this._isOpen) {
        this.calculatePosition();
      }
    };

    this._resizeHandler = () => {
      if (this._isOpen) {
        this.calculatePosition();
      }
    };

    document.addEventListener('scroll', this._scrollHandler, { passive: true });
    window.addEventListener('resize', this._resizeHandler);
  }

  /**
   * Cleanup event listeners
   */
  private cleanup(): void {
    if (this._scrollHandler) {
      document.removeEventListener('scroll', this._scrollHandler);
      this._scrollHandler = null;
    }

    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
  }
}
