import { SelectOption } from './base-controller.interface.js';

/**
 * Selection controller specific interfaces
 */
export interface SelectionControllerInterface {
  selectedOptions: SelectOption[];
  selectedValues: string[];
  hasSelection: boolean;
  canSelectMultiple: boolean;
}

/**
 * Dropdown controller specific interfaces
 */
export interface DropdownControllerInterface {
  isOpen: boolean;
  position: DropdownPosition;
  availableSpace: DropdownSpace;
}

/**
 * Focus controller specific interfaces
 */
export interface FocusControllerInterface {
  focusedIndex: number;
  focusedOption: SelectOption | undefined;
  hasFocus: boolean;
}

/**
 * Validation controller specific interfaces
 */
export interface ValidationControllerInterface {
  isValid: boolean;
  validationMessage: string;
  validationState: ValidationState;
  hasValidation: boolean;
}

/**
 * Search controller specific interfaces
 */
export interface SearchControllerInterface {
  searchQuery: string;
  filteredOptions: SelectOption[];
  hasActiveSearch: boolean;
  matchedCount: number;
}

/**
 * Dropdown positioning types
 */
export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top';
}

/**
 * Available space calculation
 */
export interface DropdownSpace {
  above: number;
  below: number;
  left: number;
  right: number;
}

/**
 * Validation state enum
 */
export enum ValidationState {
  Valid = 'valid',
  Invalid = 'invalid',
  Pending = 'pending',
  Pristine = 'pristine'
}

/**
 * Event data interfaces
 */
export interface SelectChangeEventDetail {
  value: string | string[];
  selectedOptions: SelectOption[];
  previousValue?: string | string[];
}

export interface SelectFocusEventDetail {
  focusedOption: SelectOption;
  focusedIndex: number;
}

export interface SelectSearchEventDetail {
  query: string;
  filteredOptions: SelectOption[];
  matchCount: number;
}

export interface SelectValidationEventDetail {
  isValid: boolean;
  validationMessage: string;
  validationState: ValidationState;
}
