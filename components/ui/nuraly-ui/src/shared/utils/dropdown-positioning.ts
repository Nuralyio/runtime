/**
 * Shared dropdown positioning utilities
 * These functions can be used by any component that needs fixed dropdown positioning
 */

export interface DropdownPositionResult {
  top: number;
  left: number;
  width: number;
  placement: 'top' | 'bottom';
}

export interface DropdownPositionOptions {
  /** Gap between trigger and dropdown in pixels (default: 4) */
  offset?: number;
  /** Margin from viewport edges in pixels (default: 8) */
  viewportMargin?: number;
}

/**
 * Calculate the optimal placement for a dropdown (top or bottom)
 */
export function determineOptimalPlacement(
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
  return spaceAbove > spaceBelow ? 'top' : 'bottom';
}

/**
 * Calculate fixed position for a dropdown relative to a trigger element
 */
export function calculateFixedPosition(
  triggerElement: HTMLElement,
  dropdownElement: HTMLElement,
  options: DropdownPositionOptions = {}
): DropdownPositionResult {
  const { offset = 4, viewportMargin = 8 } = options;

  const triggerRect = triggerElement.getBoundingClientRect();
  const dropdownRect = dropdownElement.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const viewportWidth = window.visualViewport?.width || window.innerWidth;

  // Calculate available space
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  // Use actual dropdown height if available, otherwise estimate
  const estimatedDropdownHeight = dropdownRect.height || 200;
  const placement = determineOptimalPlacement(estimatedDropdownHeight, spaceAbove, spaceBelow);

  // Calculate vertical position
  let top: number;
  if (placement === 'bottom') {
    top = triggerRect.bottom + offset;
  } else {
    top = triggerRect.top - estimatedDropdownHeight - offset;
  }

  // Horizontal position - align to trigger's left edge
  let left = triggerRect.left;

  // Ensure dropdown stays within viewport bounds
  const dropdownWidth = triggerRect.width;
  left = Math.max(viewportMargin, Math.min(left, viewportWidth - dropdownWidth - viewportMargin));
  top = Math.max(viewportMargin, Math.min(top, viewportHeight - estimatedDropdownHeight - viewportMargin));

  return {
    top,
    left,
    width: triggerRect.width,
    placement
  };
}

/**
 * Apply fixed positioning styles to a dropdown element
 */
export function applyFixedPosition(
  dropdownElement: HTMLElement,
  position: DropdownPositionResult,
  zIndex: string = '9999'
): void {
  dropdownElement.style.position = 'fixed';
  dropdownElement.style.top = `${position.top}px`;
  dropdownElement.style.left = `${position.left}px`;
  dropdownElement.style.removeProperty('right');
  dropdownElement.style.removeProperty('bottom');
  dropdownElement.style.minWidth = `${position.width}px`;
  dropdownElement.style.removeProperty('width');
  dropdownElement.style.zIndex = zIndex;
  dropdownElement.style.height = 'auto';
  dropdownElement.style.minHeight = 'auto';

  // Update placement classes
  dropdownElement.classList.remove('placement-top', 'placement-bottom');
  dropdownElement.classList.add(`placement-${position.placement}`);
}

/**
 * Calculate available space for dropdown content and apply height constraints
 */
export function applyHeightConstraints(
  dropdownElement: HTMLElement,
  triggerElement: HTMLElement,
  placement: 'top' | 'bottom',
  options: { viewportMargin?: number; maxHeight?: string } = {}
): void {
  const { viewportMargin = 8, maxHeight } = options;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const triggerBounds = triggerElement.getBoundingClientRect();
  const naturalHeight = dropdownElement.scrollHeight;

  let availableSpace: number;
  if (placement === 'bottom') {
    availableSpace = viewportHeight - triggerBounds.bottom - viewportMargin - 2;
  } else {
    availableSpace = triggerBounds.top - viewportMargin - 2;
  }

  if (maxHeight) {
    // Use custom maxHeight
    dropdownElement.style.maxHeight = maxHeight;
    dropdownElement.style.overflowY = 'auto';
  } else if (naturalHeight > availableSpace) {
    // Constrain to available space
    dropdownElement.style.maxHeight = `${availableSpace}px`;
    dropdownElement.style.overflowY = 'auto';
  } else {
    // Content fits naturally
    dropdownElement.style.maxHeight = `${naturalHeight}px`;
    dropdownElement.style.overflowY = 'auto';
  }
}

/**
 * Reset all positioning styles on a dropdown element
 */
export function resetDropdownPosition(dropdownElement: HTMLElement): void {
  const properties = [
    'position', 'top', 'left', 'right', 'bottom',
    'width', 'min-width', 'max-height', 'min-height',
    'height', 'overflow-y', 'transform', 'display',
    'opacity', 'visibility', 'z-index'
  ];

  properties.forEach(prop => dropdownElement.style.removeProperty(prop));
  dropdownElement.classList.remove('placement-top', 'placement-bottom');
}

/**
 * Check if trigger element is visible in viewport
 */
export function isTriggerInViewport(triggerElement: HTMLElement): boolean {
  const rect = triggerElement.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  return rect.bottom >= 0 && rect.top <= viewportHeight;
}
