/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Constants for the select component
 */

/**
 * Event names fired by the select component
 */
export const SELECT_EVENTS = {
  /** Fired when selection changes */
  CHANGE: 'nr-change',
  /** Fired when component receives focus */
  FOCUS: 'nr-focus',
  /** Fired when component loses focus */
  BLUR: 'nr-blur',
  /** Fired when dropdown opens */
  DROPDOWN_OPEN: 'nr-dropdown-open',
  /** Fired when dropdown closes */
  DROPDOWN_CLOSE: 'nr-dropdown-close',
  /** Fired when validation state changes */
  VALIDATION: 'nr-validation',
  /** Fired when validation error occurs */
  ERROR: 'nr-controller-error',
} as const;

/**
 * CSS class names used throughout the select component
 */
export const SELECT_CLASSES = {
  /** Main wrapper element class */
  WRAPPER: 'wrapper',
  /** Select container class */
  SELECT: 'select',
  /** Clickable trigger area class */
  TRIGGER: 'select-trigger',
  /** Dropdown options container class */
  OPTIONS: 'options',
  /** Individual option class */
  OPTION: 'option',
  /** Selected option state class */
  SELECTED: 'selected',
  /** Focused option state class */
  FOCUSED: 'focused',
  /** Disabled state class */
  DISABLED: 'disabled',
  /** Selected option tag class (multiple mode) */
  TAG: 'tag',
  /** Tag label text class */
  TAG_LABEL: 'tag-label',
  /** Tag close button class */
  TAG_CLOSE: 'tag-close',
  /** Icons container class */
  ICONS_CONTAINER: 'icons-container',
  /** Dropdown arrow icon class */
  ARROW_ICON: 'arrow-icon',
  /** Clear selection icon class */
  CLEAR_ICON: 'clear-icon',
  /** Status/validation icon class */
  STATUS_ICON: 'status-icon',
  /** Selected option check mark class */
  CHECK_ICON: 'check-icon',
  /** Validation message class */
  VALIDATION_MESSAGE: 'validation-message',
  /** Placeholder text class */
  PLACEHOLDER: 'placeholder',
  /** No options available message class */
  NO_OPTIONS: 'no-options',
  /** No options content wrapper class */
  NO_OPTIONS_CONTENT: 'no-options-content',
  /** No options icon class */
  NO_OPTIONS_ICON: 'no-options-icon',
  /** No options text class */
  NO_OPTIONS_TEXT: 'no-options-text',
  /** Search container class */
  SEARCH_CONTAINER: 'search-container',
  /** Search input class */
  SEARCH_INPUT: 'search-input',
  /** Search icon class */
  SEARCH_ICON: 'search-icon',
  /** Search clear button class */
  SEARCH_CLEAR: 'search-clear',
} as const;

/**
 * ARIA roles and attributes for accessibility compliance
 */
export const SELECT_ARIA = {
  /** ARIA role for the main select element */
  COMBOBOX: 'combobox',
  /** ARIA role for the options container */
  LISTBOX: 'listbox',
  /** ARIA role for individual options */
  OPTION: 'option',
  /** ARIA attribute indicating dropdown expanded state */
  EXPANDED: 'aria-expanded',
  /** ARIA attribute indicating popup presence */
  HASPOPUP: 'aria-haspopup',
  /** ARIA attribute for multiple selection capability */
  MULTISELECTABLE: 'aria-multiselectable',
  /** ARIA attribute for selected state */
  SELECTED: 'aria-selected',
  /** ARIA attribute for disabled state */
  DISABLED: 'aria-disabled',
  /** ARIA attribute for required field */
  REQUIRED: 'aria-required',
  /** ARIA attribute for validation state */
  INVALID: 'aria-invalid',
  /** ARIA attribute linking to description */
  DESCRIBEDBY: 'aria-describedby',
  LABELLEDBY: 'aria-labelledby',
} as const;

// Default values
export const SELECT_DEFAULTS = {
  PLACEHOLDER: 'Select an option',
  MAX_HEIGHT: 'auto',
  DROPDOWN_OFFSET: 4,
  TAG_MAX_WIDTH: '150px',
  TRANSITION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
} as const;

// Key codes for keyboard navigation
export const SELECT_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
} as const;

// Legacy constants for backward compatibility
export const EMPTY_STRING = '';
export const MULTIPLE_OPTIONS_SEPARATOR = ', ';
