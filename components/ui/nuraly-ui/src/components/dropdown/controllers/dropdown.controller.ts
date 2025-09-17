import { DropdownController, DropdownPosition } from '../interfaces/index.js';
import { BaseDropdownController } from './base.controller.js';
import type { NrDropdownElement } from '../dropdown.component.js';

export class NrDropdownController extends BaseDropdownController implements DropdownController {
  private _isOpen: boolean = false;
  private _position: DropdownPosition = { top: 0, left: 0, width: 0, placement: 'bottom' };
  private _triggerElement: HTMLElement | null = null;
  private _dropdownElement: HTMLElement | null = null;
  private _outsideClickHandler: ((event: Event) => void) | null = null;
  private _keydownHandler: ((event: KeyboardEvent) => void) | null = null;
  private _hoverTimer: number | null = null;
  private _triggerClickHandler: ((event: Event) => void) | null = null;
  private _triggerHoverHandler: ((event: Event) => void) | null = null;
  private _triggerLeaveHandler: ((event: Event) => void) | null = null;
  private _triggerFocusHandler: ((event: Event) => void) | null = null;
  private _triggerBlurHandler: ((event: Event) => void) | null = null;
  private _scrollHandler: ((event: Event) => void) | null = null;
  private _resizeHandler: ((event: Event) => void) | null = null;

  constructor(host: NrDropdownElement) {
    super(host);
    this._isOpen = host.open;
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get position(): DropdownPosition {
    return { ...this._position };
  }

  override hostConnected(): void {
  }

  override hostUpdated(): void {
    if (this._isOpen !== this.host.open) {
      this._isOpen = this.host.open;
    }
    
    if (!this._triggerElement) {
      this.setupTriggerListeners();
    }
  }

  override hostDisconnected(): void {
    this.cleanup();
  }

  open(): void {
    try {
      if (!this._isOpen && !this.host.disabled) {
        this._isOpen = true;
        this.host.open = true;
        this.requestUpdate();
        
        setTimeout(() => {
          this.calculatePosition();
          this.setupEventListeners();
        }, 10);

        this.dispatchEvent(
          new CustomEvent('nr-dropdown-open', {
            bubbles: true,
            composed: true,
            detail: { dropdown: this.host }
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'open');
    }
  }

  close(): void {
    try {
      if (this._isOpen) {
        this.removeEventListeners();
        
        this._isOpen = false;
        this.host.open = false;
        this.requestUpdate();

        this.dispatchEvent(
          new CustomEvent('nr-dropdown-close', {
            bubbles: true,
            composed: true,
            detail: { dropdown: this.host }
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'close');
    }
  }

  toggle(): void {
    try {
      if (this._isOpen) {
        this.close();
      } else {
        this.open();
      }
    } catch (error) {
      this.handleError(error as Error, 'toggle');
    }
  }

  private removeTriggerListeners(): void {
    if (!this._triggerElement) return;

    if (this._triggerClickHandler) {
      this._triggerElement.removeEventListener('click', this._triggerClickHandler);
      this._triggerClickHandler = null;
    }
    if (this._triggerHoverHandler) {
      this._triggerElement.removeEventListener('mouseenter', this._triggerHoverHandler);
      this._triggerHoverHandler = null;
    }
    if (this._triggerLeaveHandler) {
      this._triggerElement.removeEventListener('mouseleave', this._triggerLeaveHandler);
      this._triggerLeaveHandler = null;
    }
    if (this._triggerFocusHandler) {
      this._triggerElement.removeEventListener('focusin', this._triggerFocusHandler);
      this._triggerFocusHandler = null;
    }
    if (this._triggerBlurHandler) {
      this._triggerElement.removeEventListener('focusout', this._triggerBlurHandler);
      this._triggerBlurHandler = null;
    }
  }

  private findDropdownElements(): void {
    this._dropdownElement = this.findElement('.dropdown__panel');
    this._triggerElement = this.findElement('.dropdown__trigger');
  }

  private setupTriggerListeners(): void {
    this.findDropdownElements();
    
    if (!this._triggerElement) {
      return;
    }

    this.removeTriggerListeners();

    switch (this.host.trigger) {
      case 'click':
        this._triggerClickHandler = this.handleTriggerClick.bind(this);
        this._triggerElement.addEventListener('click', this._triggerClickHandler);
        break;
      case 'hover':
        this._triggerHoverHandler = this.handleTriggerHover.bind(this);
        this._triggerLeaveHandler = this.handleTriggerLeave.bind(this);
        this._triggerElement.addEventListener('mouseenter', this._triggerHoverHandler);
        this._triggerElement.addEventListener('mouseleave', this._triggerLeaveHandler);
        break;
      case 'focus':
        this._triggerFocusHandler = this.handleTriggerFocus.bind(this);
        this._triggerBlurHandler = this.handleTriggerBlur.bind(this);
        this._triggerElement.addEventListener('focusin', this._triggerFocusHandler);
        this._triggerElement.addEventListener('focusout', this._triggerBlurHandler);
        break;
    }
  }

  private setupEventListeners(): void {
    if (this.host.closeOnOutsideClick) {
      this._outsideClickHandler = this.handleOutsideClick.bind(this);
      document.addEventListener('click', this._outsideClickHandler, true);
    }

    if (this.host.closeOnEscape) {
      this._keydownHandler = this.handleKeydown.bind(this);
      document.addEventListener('keydown', this._keydownHandler);
    }

    this._scrollHandler = this.handleScroll.bind(this);
    this._resizeHandler = this.handleResize.bind(this);
    window.addEventListener('scroll', this._scrollHandler, true);
    window.addEventListener('resize', this._resizeHandler);
  }

  private removeEventListeners(): void {
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler, true);
      this._outsideClickHandler = null;
    }

    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }

    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler, true);
      this._scrollHandler = null;
    }

    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
  }

  private handleTriggerClick(): void {
    if (this.host.disabled) {
      return;
    }
    
    this.toggle();
  }

  private handleTriggerHover(): void {
    if (this.host.disabled) {
      return;
    }
    
    if (this._hoverTimer) {
      clearTimeout(this._hoverTimer);
    }
    
    this._hoverTimer = window.setTimeout(() => {
      this.open();
    }, this.host.delay);
  }

  private handleTriggerLeave(): void {
    if (this._hoverTimer) {
      clearTimeout(this._hoverTimer);
      this._hoverTimer = null;
    }
    
    setTimeout(() => {
      if (!this.isHoveringDropdown()) {
        this.close();
      }
    }, 100);
  }

  private handleTriggerFocus(): void {
    if (this.host.disabled) {
      return;
    }
    this.open();
  }

  private handleTriggerBlur(): void {
    setTimeout(() => {
      if (!this.isDropdownFocused()) {
        this.close();
      }
    }, 100);
  }

  private handleOutsideClick(event: Event): void {
    const target = event.target as Element;
    
    if (this._triggerElement?.contains(target)) {
      return;
    }
    
    const dropdownPanel = target.closest('.dropdown__panel');
    
    if (dropdownPanel) {
      return;
    }
    
    if (this._dropdownElement?.contains(target)) {
      return;
    }
    
    if (target.closest('nr-dropdown')) {
      return;
    }
    
    const customContent = target.closest('.dropdown__custom-content');
    if (customContent) {
      return;
    }
    
    const interactiveElements = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'A'];
    if (interactiveElements.includes(target.tagName)) {
      const dropdownPanelParent = target.closest('.dropdown__panel');
      if (dropdownPanelParent) {
        return;
      }
    }
    
    if (target.closest('.dropdown') || target.closest('[class*="dropdown"]')) {
      return;
    }
    
    if (!this.host.closeOnOutsideClick) {
      return;
    }
    
    this.close();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  private handleScroll(): void {
  }

  private handleResize(): void {
    if (this._isOpen) {
      this.calculatePosition();
    }
  }

  calculatePosition(): void {
    try {
      if (!this._dropdownElement || !this._triggerElement) {
        this.findDropdownElements();
      }

      if (!this._dropdownElement || !this._triggerElement) {
        return;
      }

      const triggerRect = this._triggerElement.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      const estimatedDropdownHeight = 200;
      const placement = this.determineOptimalPlacement(estimatedDropdownHeight, spaceAbove, spaceBelow);
      
      this.applyPlacement(placement);

    } catch (error) {
      this.handleError(error as Error, 'calculatePosition');
    }
  }

  private determineOptimalPlacement(
    dropdownHeight: number, 
    spaceAbove: number, 
    spaceBelow: number
  ): 'top' | 'bottom' {
    if (spaceBelow >= dropdownHeight) {
      return 'bottom';
    }
    
    if (spaceAbove >= dropdownHeight) {
      return 'top';
    }
    
    return spaceAbove > spaceBelow ? 'top' : 'bottom';
  }

  private applyPlacement(placement: 'top' | 'bottom'): void {
    if (!this._dropdownElement) return;
    
    this._dropdownElement.classList.remove('dropdown__panel--top', 'dropdown__panel--bottom');
    
    this._dropdownElement.classList.add(`dropdown__panel--${placement}`);
    
    this._position.placement = placement;
  }

  private isHoveringDropdown(): boolean {
    return this._dropdownElement?.matches(':hover') || false;
  }

  private isDropdownFocused(): boolean {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    if (this._dropdownElement?.contains(activeElement)) {
      return true;
    }
    
    const customContent = activeElement.closest('.dropdown__custom-content');
    if (customContent) {
      return true;
    }
    
    const interactiveElements = ['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'A'];
    if (interactiveElements.includes(activeElement.tagName)) {
      const dropdownPanel = activeElement.closest('.dropdown__panel');
      if (dropdownPanel) {
        return true;
      }
    }
    
    return false;
  }

  handleItemClick(item: any): void {
    this.dispatchEvent(
      new CustomEvent('nr-dropdown-item-click', {
        bubbles: true,
        composed: true,
        detail: { item, dropdown: this.host }
      })
    );

    if (this.host.autoClose) {
      this.close();
    }
  }

  private cleanup(): void {
    this.removeEventListeners();
    this.removeTriggerListeners();
    
    if (this._hoverTimer) {
      clearTimeout(this._hoverTimer);
      this._hoverTimer = null;
    }
  }
}