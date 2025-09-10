/**
 * Shared dropdown controller interface
 */
export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top';
}

export interface DropdownSpace {
  above: number;
  below: number;
  left: number;
  right: number;
}

/**
 * Host interface for components using dropdown functionality
 */
export interface DropdownHost {
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
}

/**
 * Dropdown controller interface
 */
export interface DropdownController {
  readonly isOpen: boolean;
  readonly position: DropdownPosition;
  open(): void;
  close(): void;
  toggle(): void;
  calculatePosition(): void;
  resetPosition(): void;
  setElements(dropdownElement: HTMLElement, triggerElement: HTMLElement): void;
  getAvailableSpace(): DropdownSpace;
}
