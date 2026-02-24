/**
 * Configuration interface for select options with comprehensive properties
 */
export interface SelectOption {
  /** Unique value for the option */
  value: string;
  
  /** Display text for the option */
  label: string;
  
  /** Optional icon name to display with the option */
  icon?: string;
  
  /** Whether the option is disabled and cannot be selected */
  disabled?: boolean;
  
  /** Validation state of the option */
  state?: SelectState;
  
  /** Optional message to display with the option */
  message?: string;
  
  /** HTML content to render instead of plain text label */
  htmlContent?: string;
  
  /** Custom CSS class to apply to the option */
  className?: string;
  
  /** Inline CSS styles for the option */
  style?: string;
  
  /** Tooltip text shown on hover */
  title?: string;
  
  /** Custom HTML ID for the option */
  id?: string;
  
  /** Group name for option grouping */
  group?: string;
  
  /** Additional descriptive text below the label */
  description?: string;
  
}

/**
 * Select state for validation and visual feedback
 */
export type SelectState = 'error' | 'warning' | 'success';

/**
 * Select component type variants
 */
export enum SelectType {
  Default = 'default',
  Inline = 'inline',
  Button = 'button',
  Slot = 'slot',
}

/**
 * Select status/state enum
 */
export enum SelectStatus {
  Default = 'default',
  Warning = 'warning',
  Error = 'error',
  Success = 'success',
}

/**
 * Select component size variants
 */
export enum SelectSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}
export enum OptionSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

/**
 * Select component direction for layout
 */
export enum SelectDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/**
 * Select component variant styles
 */
export enum SelectVariant {
  Default = 'default',
  Solid = 'solid',
  Outline = 'outline',
  Borderless = 'borderless',
}

/**
 * Dropdown placement options
 */
export enum DropdownPlacement {
  Bottom = 'bottom',
  Top = 'top',
  Auto = 'auto',
}

/**
 * Search mode for filterable selects
 */
export enum SearchMode {
  None = 'none',
  StartsWith = 'starts-with',
  Contains = 'contains',
  Fuzzy = 'fuzzy',
}
