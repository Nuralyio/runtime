/**
 * Base controller interface for select component controllers
 * All controllers should extend this interface for consistency
 */
export interface SelectBaseController {
  readonly host: SelectHost;
  handleError?(error: Error, context: string): void;
}

/**
 * Error handling interface for controllers
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Host element interface defining the contract between controllers and the select component
 */
export interface SelectHost {
  options: SelectOption[];
  value: string | string[];
  defaultValue: string | string[];
  disabled: boolean;
  required: boolean;
  multiple: boolean;
  placeholder: string;
  show: boolean;
  requestUpdate(): void;
  dispatchEvent(event: Event): boolean;
}

/**
 * Selection controller interface for managing option selection
 */
export interface SelectionController extends SelectBaseController {
  getSelectedOptions(): SelectOption[];
  getSelectedOption(): SelectOption | undefined;
  selectOption(option: SelectOption): void;
  unselectOption(option: SelectOption): void;
  clearSelection(): void;
  isOptionSelected(option: SelectOption): boolean;
  isOptionDisabled(option: SelectOption): boolean;
  toggleOption(option: SelectOption): void;
}

/**
 * Keyboard controller interface for handling keyboard navigation
 */
export interface KeyboardController extends SelectBaseController {
  handleKeyDown(event: KeyboardEvent): void;
  navigateNext(): void;
  navigatePrevious(): void;
  selectFocused(): void;
  openDropdown(): void;
  closeDropdown(): void;
}

/**
 * Focus controller interface for managing focus states
 */
export interface FocusController extends SelectBaseController {
  setFocusedOption(index: number): void;
  getFocusedOption(): SelectOption | undefined;
  focus(): void;
  blur(): void;
  focusNext(): void;
  focusPrevious(): void;
  readonly focusedIndex: number;
}

/**
 * Dropdown controller interface for managing dropdown positioning and visibility
 */
export interface DropdownController extends SelectBaseController {
  open(): void;
  close(): void;
  toggle(): void;
  calculatePosition(): void;
  resetPosition(): void;
  readonly isOpen: boolean;
}

/**
 * Validation controller interface for form validation
 */
export interface ValidationController extends SelectBaseController {
  validate(): boolean;
  reset(): void;
  getFormData(): { [key: string]: string | string[] };
  readonly isValid: boolean;
  readonly validationMessage: string;
}

/**
 * Search controller interface for filterable select options
 */
export interface SearchController extends SelectBaseController {
  search(query: string): void;
  clearSearch(): void;
  getFilteredOptions(): SelectOption[];
  readonly searchQuery: string;
  readonly hasSearch: boolean;
}

/**
 * Select option interface extending the base option type
 */
export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  state?: SelectState;
  message?: string;
  htmlContent?: string;
  className?: string;
  style?: string;
  title?: string;
  id?: string;
  group?: string;
  description?: string;
}

/**
 * Select state type for validation and visual feedback
 */
export type SelectState = 'error' | 'warning' | 'success';
