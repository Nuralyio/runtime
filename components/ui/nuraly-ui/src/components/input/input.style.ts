import { css } from 'lit';

/**
 * Input component styles for the Hybrid UI Library
 * 
 * This file contains all the styling for the nr-input component, including:
 * - Base input styles with CSS custom properties for theming
 * - Multiple input states (default, warning, error)
 * - Size variations (small, medium, large)
 * - Different input types (text, password, number, calendar)
 * - Icon positioning and styling with comprehensive CSS variable overrides
 * - Focus, disabled, and validation states
 * - Dark theme support
 * 
 * Icon Color Customization:
 * The input component provides multiple levels of CSS variable overrides for icon colors:
 * 
 * Global Level:
 * - --nuraly-color-input-icon: Controls all icons in input components
 * - --nuraly-size-input-icon: Controls size of all icons in input components
 * - --nuraly-color-input-icon-hover: Hover state for all icons
 * - --nuraly-color-input-icon-active: Active state for all icons
 * - --nuraly-color-input-icon-disabled: Disabled state for all icons
 * 
 * Specific Icon Types:
 * - --nuraly-color-input-warning-icon: Warning state icons
 * - --nuraly-color-input-error-icon: Error state icons
 * - --nuraly-color-input-calendar-icon: Calendar input type icons
 * - --nuraly-color-input-password-icon: Password toggle icons
 * - --nuraly-color-input-copy-icon: Copy functionality icons
 * - --nuraly-color-input-clear-icon: Clear functionality icons
 * - --nuraly-color-input-number-icons: Number input increment/decrement icons
 * 
 * Usage Examples:
 * ```css
 * :root {
 *   --nuraly-color-input-icon: #0066cc;
 *   --nuraly-color-input-error-icon: #cc0000;
 *   --nuraly-size-input-icon: 20px;
 * }
 * 
 * .custom-input {
 *   --nuraly-color-input-icon: #purple;
 * }
 * ```
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of input appearance.
 */

const inputStyle = css`
  /* 
   * Host element base styles
   * Container for the input component with flexible layout
   */
  :host {
    display: flex;
    flex-direction: column;
    font-family: var(--nuraly-font-family-input, 'IBM Plex Sans', ui-sans-serif, system-ui);
  }

  /* 
   * Base input wrapper and input element styles
   * Background applied to wrapper to cover entire container including addons
   * Uses theme CSS custom properties for comprehensive theming support
   */
  .input-wrapper {
    background-color: var(--nuraly-color-input-background, var(--nuraly-color-input-background-fallback, #ffffff));
  }

  /* Carbon Design System wrapper override */
  html[data-theme^="carbon"] nr-input .input-wrapper,
  html[data-theme^="default"] nr-input .input-wrapper,
  body[data-theme^="carbon"] nr-input .input-wrapper,
  body[data-theme^="default"] nr-input .input-wrapper,
  [data-theme^="carbon"] nr-input .input-wrapper,
  [data-theme^="default"] nr-input .input-wrapper,
  .input-wrapper[data-theme^="carbon"],
  .input-wrapper[data-theme^="default"] {
    background-color: var(--nuraly-color-input-background) !important;
  }

  #input-container > input {
    background-color: transparent;
    border: var(--nuraly-input-border, none);
    outline: var(--nuraly-input-outline, none);
    flex: 1;
    min-width: 0;
    width: 100%;
    
    /* Typography from theme */
    font-family: var(--nuraly-font-family-input, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto);
    font-size: var(--nuraly-font-size-input, 14px);
    color: var(--nuraly-color-input-text, var(--nuraly-color-input-text-fallback, rgba(0, 0, 0, 0.88)));
    
    /* Padding from theme */
    padding: var(--nuraly-spacing-input-medium-vertical, 4px) var(--nuraly-spacing-input-medium-horizontal, 11px);
  }

  /* 
   * Disabled state styles for wrapper and input
   * Applied when input is disabled - removes interactivity and applies muted colors
   */
  :host([disabled]) .input-wrapper {
    background-color: var(--nuraly-color-input-disabled-background, var(--nuraly-color-input-disabled-background-fallback, #f4f4f4));
  }

  :host([disabled]) #input-container > input {
    background-color: transparent;
    cursor: var(--nuraly-cursor-disabled, not-allowed);
    color: var(--nuraly-color-input-disabled-text, var(--nuraly-color-input-disabled-text-fallback, rgba(0, 0, 0, 0.25)));
  }

  /* 
   * Icon base styles
   * Common styling for all icons within the input component
   * Provides comprehensive CSS variable override system
   */
  nr-icon {
    display: flex;
    align-items: center;
    
    /* Global icon color override - applies to all icons in input */
    --nuraly-color-icon: var(--nuraly-color-input-icon, var(--nuraly-color-icon, var(--nuraly-color-icon-fallback, #161616)));
    
    /* Size override for input icons */
    --nuraly-icon-size: var(--nuraly-size-input-icon, var(--nuraly-icon-size, var(--nuraly-icon-size-fallback, 18px)));
    
    /* Interactive state overrides */
    --nuraly-color-icon-hover: var(--nuraly-color-input-icon-hover, var(--nuraly-color-icon-hover, var(--nuraly-color-icon-hover-fallback, #0f62fe)));
    --nuraly-color-icon-active: var(--nuraly-color-input-icon-active, var(--nuraly-color-icon-active, var(--nuraly-color-icon-active-fallback, #054ada)));
    --nuraly-color-icon-disabled: var(--nuraly-color-input-icon-disabled, var(--nuraly-color-icon-disabled, var(--nuraly-color-icon-disabled-fallback, #c6c6c6)));
  }

  /* 
   * Placeholder styling
   * Customizable placeholder text appearance
   */
  ::placeholder {
    color: var(--nuraly-color-input-placeholder, var(--nuraly-color-input-placeholder-fallback, #a8a8a8));
    font-size: var(--nuraly-font-size-input-placeholder, 14px);
    font-family: var(--nuraly-font-family-input, 'IBM Plex Sans', ui-sans-serif, system-ui);
  }

  /* 
   * Disabled placeholder styling
   * Applied when input is disabled
   */
  :host([disabled]) ::placeholder {
    color: var(--nuraly-color-input-disabled-placeholder, var(--nuraly-color-input-disabled-placeholder-fallback, #c6c6c6));
  }

  /* ========================================
   * ICON VARIANTS AND STATES
   * ======================================== */

  /* Warning state icon */
  #warning-icon {
    --nuraly-color-icon: var(--nuraly-color-input-warning-icon, #f1c21b);
  }

  /* Error state icon */
  #error-icon {
    --nuraly-color-icon: var(--nuraly-color-input-error-icon, #da1e28);
  }

  /* Calendar input type icon */
  #calendar-icon {
    --nuraly-color-icon: var(--nuraly-color-input-calendar-icon, #161616);
  }

  /* Password toggle icon */
  #password-icon {
    padding-left: var(--nuraly-input-password-icon-padding-left, var(--nuraly-password-icon-padding-left, 8px));
    padding-right: var(--nuraly-input-password-icon-padding-right, var(--nuraly-password-icon-padding-right, 8px));
    cursor: var(--nuraly-cursor-interactive, pointer);
    --nuraly-color-icon: var(--nuraly-color-input-password-icon, #161616);
  }

  /* Copy functionality icon */
  #copy-icon {
    padding-right: var(--nuraly-input-copy-icon-padding-right, var(--nuraly-copy-icon-padding-right, 8px));
    --nuraly-color-icon: var(--nuraly-color-input-copy-icon, #161616);
    cursor: var(--nuraly-cursor-interactive, pointer);
  }

  /* Clear functionality icon */
  #clear-icon {
    padding-right: var(--nuraly-input-clear-icon-padding-right, var(--nuraly-clear-icon-padding-right, 8px));
    --nuraly-color-icon: var(--nuraly-color-input-clear-icon, #161616);
    cursor: var(--nuraly-cursor-interactive, pointer);
  }

  /* 
   * Number input increment/decrement icons container
   * Positioned absolutely for overlay on input
   */
  #number-icons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: var(--nuraly-cursor-interactive, pointer);
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: var(--nuraly-input-number-icons-container-width, var(--nuraly-number-icons-container-width, 50px));
    padding-right: var(--nuraly-input-number-icons-container-padding-right, var(--nuraly-number-icons-container-padding-right, 8px));
  }

  /* Individual number icons styling */
  #number-icons nr-icon {
    --nuraly-color-icon: var(--nuraly-color-input-number-icons, #161616);
    padding-left: var(--nuraly-input-number-icons-padding-left, var(--nuraly-number-icons-padding-left, 4px));
    padding-right: var(--nuraly-input-number-icons-padding-right, var(--nuraly-number-icons-padding-right, 4px));
    width: var(--nuraly-input-number-icons-width, var(--nuraly-number-icons-width, 24px));
    height: var(--nuraly-input-number-icons-height, var(--nuraly-number-icons-height, 24px));
  }

  /* Number icons separator styling */
  #icons-separator {
    color: var(--nuraly-input-number-icons-separator-color, var(--nuraly-number-icons-separator-color));
    padding-bottom: var(--nuraly-input-number-icons-separator-padding-bottom, var(--nuraly-number-icons-separator-padding-bottom));
    padding-left: var(--nuraly-input-number-icons-separator-padding-left, var(--nuraly-number-icons-separator-padding-left));
    padding-right: var(--nuraly-input-number-icons-separator-padding-right, var(--nuraly-number-icons-separator-padding-right));
  }

  /* 
   * Disabled state for all icons
   * Applied when input is disabled - reduces opacity and disables interaction
   */
  :host([disabled]) #password-icon,
  :host([disabled]) #error-icon,
  :host([disabled]) #warning-icon,
  :host([disabled]) #number-icons,
  :host([disabled]) #calendar-icon,
  :host([disabled]) #copy-icon,
  :host([disabled]) #clear-icon {
    opacity: var(--nuraly-input-disabled-icon-opacity, var(--nuraly-disabled-icon-opacity));
  }

  /* Disabled icons cursor override */
  :host([disabled]) #password-icon,
  :host([disabled]) #number-icons,
  :host([disabled]) #copy-icon,
  :host([disabled]) #clear-icon {
    cursor: not-allowed;
  }

  /* ========================================
   * INPUT CONTAINER STYLES
   * ======================================== */

  /* 
   * Input wrapper - contains addons and input container
   * Provides horizontal layout for addon before/after elements
   */
  .input-wrapper {
    display: flex;
    align-items: stretch;
    width: 100%;
  }

  /* 
   * Addon before element - content before input (outside borders)
   * Styled to visually connect with input
   */
  .input-addon-before {
    background-color: var(--nuraly-input-addon-background-color, var(--nuraly-addon-background-color));
    border: var(--nuraly-input-border, var(--nuraly-border));
    border-right: none;
    border-top-left-radius: var(--nuraly-input-border-radius, var(--nuraly-border-radius));
    border-bottom-left-radius: var(--nuraly-input-border-radius, var(--nuraly-border-radius));
    padding: var(--nuraly-input-addon-padding, var(--nuraly-addon-padding));
    display: flex;
    align-items: center;
    color: var(--nuraly-input-addon-color, var(--nuraly-addon-color));
    font-size: var(--nuraly-input-font-size, var(--nuraly-font-size));
    white-space: nowrap;
    min-width: 0; /* Allow shrinking */
    flex-shrink: 0; /* Prevent shrinking */
  }

  /* 
   * Addon after element - content after input (outside borders)
   * Styled to visually connect with input
   */
  .input-addon-after {
    background-color: var(--nuraly-input-addon-background-color, var(--nuraly-addon-background-color));
    border: var(--nuraly-input-border, var(--nuraly-border));
    border-left: none;
    border-top-right-radius: var(--nuraly-input-border-radius, var(--nuraly-border-radius));
    border-bottom-right-radius: var(--nuraly-input-border-radius, var(--nuraly-border-radius));
    padding: var(--nuraly-input-addon-padding, var(--nuraly-addon-padding));
    display: flex;
    align-items: center;
    color: var(--nuraly-input-addon-color, var(--nuraly-addon-color));
    font-size: var(--nuraly-input-font-size, var(--nuraly-font-size));
    white-space: nowrap;
    min-width: 0; /* Allow shrinking */
    flex-shrink: 0; /* Prevent shrinking */
  }

  /* 
   * Input container border radius adjustments when addons are present
   * Removes border radius on sides where addons are attached
   */
  .input-wrapper:has(.input-addon-before) #input-container {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }

  .input-wrapper:has(.input-addon-after) #input-container {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  /* 
   * Main input container element
   * Uses theme CSS custom properties for comprehensive border and layout control
   */
  #input-container {
    /* Default Ant Design outlined style */
    border: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-border, #d9d9d9);
    border-radius: var(--nuraly-border-radius-input, 6px);
    
    /* Background and text styling */
    background-color: var(--nuraly-color-input-background, #ffffff);
    color: var(--nuraly-color-input-text, rgba(0, 0, 0, 0.88));
    font-family: var(--nuraly-font-family-input, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto);
    font-size: var(--nuraly-font-size-input, 14px);
    
    /* Layout */
    display: flex;
    position: relative;
    flex: 1; /* Take available space in wrapper */
    min-width: 0; /* Allow shrinking below content size */
    
    /* Transitions for smooth theme changes */
    transition: var(--nuraly-transition-input, border-color 0.2s, box-shadow 0.2s);
  }

  /* Carbon Design System override - Carbon specific styles */
  html[data-theme^="carbon"] nr-input #input-container,
  body[data-theme^="carbon"] nr-input #input-container,
  [data-theme^="carbon"] nr-input #input-container,
  .input-wrapper[data-theme^="carbon"] #input-container {
    border: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-border, transparent) !important;
    border-bottom: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border-bottom, #8d8d8d) !important;
    border-radius: var(--nuraly-border-radius-input, 0) !important;
    background-color: var(--nuraly-color-input-background, #f4f4f4) !important;
    color: var(--nuraly-color-input-text, #161616) !important;
  }

  /* Default theme override - Default specific styles */
  html[data-theme^="default"] nr-input #input-container,
  body[data-theme^="default"] nr-input #input-container,
  [data-theme^="default"] nr-input #input-container,
  .input-wrapper[data-theme^="default"] #input-container {
    border: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-border, #d9d9d9) !important;
    border-radius: var(--nuraly-border-radius-input, 6px) !important;
    background-color: var(--nuraly-color-input-background, #ffffff) !important;
    color: var(--nuraly-color-input-text, rgba(0, 0, 0, 0.88)) !important;
  }

  /* Carbon input element padding override */
  html[data-theme^="carbon"] nr-input #input-container > input,
  body[data-theme^="carbon"] nr-input #input-container > input,
  [data-theme^="carbon"] nr-input #input-container > input,
  .input-wrapper[data-theme^="carbon"] #input-container > input {
    padding: 7px 16px !important;
  }

  /* Default input element padding override */
  html[data-theme^="default"] nr-input #input-container > input,
  body[data-theme^="default"] nr-input #input-container > input,
  [data-theme^="default"] nr-input #input-container > input,
  .input-wrapper[data-theme^="default"] #input-container > input {
    padding: var(--nuraly-spacing-input-medium-vertical, 4px) var(--nuraly-spacing-input-medium-horizontal, 11px) !important;
  }

  /* Focus state for input container */
  #input-container:focus-within {
    border-color: var(--nuraly-color-input-border-focus, #1890ff);
    box-shadow: var(--nuraly-shadow-input-focus, 0 0 0 2px rgba(24, 144, 255, 0.2));
    outline: none;
  }

  /* Carbon focus override */
  html[data-theme^="carbon"] nr-input #input-container:focus-within,
  body[data-theme^="carbon"] nr-input #input-container:focus-within,
  [data-theme^="carbon"] nr-input #input-container:focus-within,
  .input-wrapper[data-theme^="carbon"] #input-container:focus-within {
    border: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border-focus, #0f62fe) !important;
    border-radius: var(--nuraly-border-radius-input, 0) !important;
    box-shadow: var(--nuraly-shadow-input-focus, none) !important;
    outline: none !important;
  }

  /* Default focus override */
  html[data-theme^="default"] nr-input #input-container:focus-within,
  body[data-theme^="default"] nr-input #input-container:focus-within,
  [data-theme^="default"] nr-input #input-container:focus-within,
  .input-wrapper[data-theme^="default"] #input-container:focus-within {
    border-color: var(--nuraly-color-input-border-focus, #1890ff) !important;
    border-radius: var(--nuraly-border-radius-input, 6px) !important;
    box-shadow: var(--nuraly-shadow-input-focus, 0 0 0 2px rgba(24, 144, 255, 0.2)) !important;
    outline: none !important;
  }

  /* 
   * Disabled container styles
   * Applied when input is disabled
   */
  :host([disabled]) #input-container {
    background-color: var(--nuraly-color-input-disabled-background, #f5f5f5);
    border-color: var(--nuraly-color-input-disabled-border, #d9d9d9);
    color: var(--nuraly-color-input-disabled-text, rgba(0, 0, 0, 0.25));
    cursor: not-allowed;
  }

  /* ========================================
   * INPUT VARIANT STYLES
   * ======================================== */

  /* 
   * Outlined variant - full border around input
   * Default: light border, focus: blue border
   */
  :host([variant='outlined']) #input-container {
    border: var(--nuraly-input-outlined-border, var(--nuraly-outlined-border));
    border-radius: var(--nuraly-input-outlined-border-radius, var(--nuraly-outlined-border-radius));
    background-color: var(--nuraly-input-outlined-background, var(--nuraly-outlined-background));
  }

  :host([variant='outlined']) .input-wrapper {
    background-color: transparent;
  }

  :host([variant='outlined']:not([state='error'])) #input-container:focus-within {
    border: var(--nuraly-input-outlined-focus-border, var(--nuraly-outlined-focus-border));
  }

  /* 
   * Filled variant - background with bottom border only
   * Subtle background with bottom border indication
   */
  :host([variant='filled']) #input-container {
    background-color: var(--nuraly-input-filled-background, var(--nuraly-filled-background));
    border-radius: var(--nuraly-input-filled-border-radius, var(--nuraly-filled-border-radius));
    border-bottom: var(--nuraly-input-filled-border-bottom, var(--nuraly-filled-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
  }

  :host([variant='filled']) .input-wrapper {
    background-color: transparent;
  }

  :host([variant='filled']:not([state='error'])) #input-container:focus-within {
    border-bottom: var(--nuraly-input-filled-focus-border-bottom, var(--nuraly-filled-focus-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
  }

  /* 
   * Borderless variant - no borders, focus with outline
   * Clean appearance with focus indication via outline
   */
  :host([variant='borderless']) #input-container {
    background-color: var(--nuraly-input-borderless-background, var(--nuraly-borderless-background));
    border: none;
    border-radius: var(--nuraly-input-borderless-border-radius, var(--nuraly-borderless-border-radius));
  }

  :host([variant='borderless']) .input-wrapper {
    background-color: transparent;
  }

  :host([variant='borderless']:not([state='error'])) #input-container:focus-within {
    outline: var(--nuraly-input-borderless-focus-outline, var(--nuraly-borderless-focus-outline));
    border: none;
  }

  /* 
   * Underlined variant - bottom border only (default/current behavior)
   * Maintains existing behavior as default
   */
  :host([variant='underlined']) #input-container {
    border-bottom: var(--nuraly-input-underlined-border-bottom, var(--nuraly-underlined-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }

  :host([variant='underlined']:not([state='error'])) #input-container:focus-within {
    border-bottom: var(--nuraly-input-underlined-focus-border-bottom, var(--nuraly-underlined-focus-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
  }

  /* ========================================
   * INPUT ELEMENT STYLES
   * ======================================== */

  /* 
   * Base input element styling
   * Full width with no default borders, using container for styling
   */
  input {
    width: 100%;
    border: none;
    outline: none;
    color: var(--nuraly-input-text-color, var(--nuraly-text-color));
    font-family: var(--nuraly-input-font-family, var(--nuraly-font-family));
    font-size: var(--nuraly-input-font-size, var(--nuraly-font-size));
  }

  /* Remove default number input spinners */
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  
  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }

  /* ========================================
   * STATE STYLES
   * ======================================== */

  /* 
   * Error state styling - works with all variants
   * Applied when state='error' and not disabled
   */
  :host(:not([disabled])[state='error']) #input-container {
    border: var(--nuraly-input-error-border, var(--nuraly-error-border)) !important;
    outline: none !important;
  }

  /* Override variant-specific error state styling */
  :host([variant='borderless'][state='error']) #input-container {
    border: var(--nuraly-input-error-border, var(--nuraly-error-border)) !important;
    outline: none !important;
  }

  :host([variant='underlined'][state='error']) #input-container,
  :host([variant='filled'][state='error']) #input-container {
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: var(--nuraly-input-error-border, var(--nuraly-error-border)) !important;
  }

  /* 
   * Number input icon positioning adjustments for error/warning states
   * When validation states are present, adjust icon positioning
   */
  :host([state='error']) input[type='number'] ~ #number-icons,
  :host([state='warning']) input[type='number'] ~ #number-icons {
    position: static;
    padding-left: var(--nuraly-input-number-icons-container-padding-left, var(--nuraly-number-icons-container-padding-left));
  }

  /* ========================================
   * SLOTTED CONTENT STYLES
   * ======================================== */

  /* 
   * Label slot styling
   * Applied to slotted label elements
   */
  ::slotted([slot='label']) {
    color: var(--nuraly-input-label-color, var(--nuraly-label-color));
    font-size: var(--nuraly-input-label-font-size, var(--nuraly-label-font-size));
    padding-bottom: var(--nuraly-input-label-padding-bottom, var(--nuraly-label-padding-bottom));
  }

  /* 
   * Helper text slot styling
   * Applied to slotted helper text elements
   */
  ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-helper-text-color, var(--nuraly-helper-text-color));
    font-size: var(--nuraly-input-helper-text-font-size, var(--nuraly-helper-text-font-size));
    padding-top: var(--nuraly-input-helper-text-padding-top, var(--nuraly-helper-text-padding-top));
    
    /* Prevent text overflow and ensure proper wrapping without affecting parent width */
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    white-space: normal;
    max-width: 100%;
    width: 0;
    min-width: 100%;
    box-sizing: border-box;
    line-height: 1.4;
  }

  /* 
   * State-specific helper text colors
   * Override helper text color based on validation state
   */
  :host([state='error']) ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-error-helper-text-color, var(--nuraly-error-helper-text-color));
  }

  :host([state='warning']) ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-warning-helper-text-color, var(--nuraly-warning-helper-text-color));
  }

  /* 
   * Disabled state for slotted content
   * Applied when input is disabled
   */
  :host([disabled]) ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-disabled-helper-text-color, var(--nuraly-disabled-helper-text-color));
  }

  :host([disabled]) ::slotted([slot='label']) {
    color: var(--nuraly-input-disabled-label-color, var(--nuraly-disabled-label-color));
  }

  /* 
   * Input prefix wrapper styling
   * Centers the prefix content vertically and horizontally
   */
  .input-prefix {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 
   * Prefix slot styling
   * Applied to slotted prefix content (icons, text, etc.)
   */
  ::slotted([slot='prefix']) {
    display: flex;
    align-items: center;
    padding-right: var(--nuraly-input-prefix-padding-right, var(--nuraly-prefix-padding-right));
    color: var(--nuraly-input-prefix-color, var(--nuraly-prefix-color));
    font-size: var(--nuraly-input-prefix-font-size, var(--nuraly-prefix-font-size));
    flex-shrink: 0;
  }

  /* 
   * Input suffix wrapper styling
   * Centers the suffix content vertically and horizontally
   */
  .input-suffix {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 
   * Suffix slot styling
   * Applied to slotted suffix content (icons, text, etc.)
   */
  ::slotted([slot='suffix']) {
    display: flex;
    align-items: center;
    padding-left: var(--nuraly-input-suffix-padding-left, var(--nuraly-suffix-padding-left));
    color: var(--nuraly-input-suffix-color, var(--nuraly-suffix-color));
    font-size: var(--nuraly-input-suffix-font-size, var(--nuraly-suffix-font-size));
    flex-shrink: 0;
  }

  /* 
   * Disabled state for prefix and suffix slots
   * Applied when input is disabled
   */
  :host([disabled]) ::slotted([slot='prefix']),
  :host([disabled]) ::slotted([slot='suffix']) {
    opacity: var(--nuraly-input-disabled-icon-opacity, var(--nuraly-disabled-icon-opacity));
    color: var(--nuraly-input-disabled-prefix-suffix-color, var(--nuraly-disabled-prefix-suffix-color));
  }
`;

/**
 * Size variation styles for the input component
 * Defines padding and spacing for different input sizes
 */
const sizeInputStyle = css`
  /* ========================================
   * SIZE VARIATIONS
   * ======================================== */

  /* Large input size variant */
  div[data-size='large'] {
    padding-top: var(--nuraly-input-large-padding-top, var(--nuraly-large-padding-top));
    padding-bottom: var(--nuraly-input-large-padding-bottom, var(--nuraly-large-padding-bottom));
    padding-left: var(--nuraly-input-large-padding-left, var(--nuraly-large-padding-left));
    padding-right: var(--nuraly-input-large-padding-right, var(--nuraly-large-padding-right));
  }

  /* Medium input size variant (default) */
  div[data-size='medium'] {
    padding-top: var(--nuraly-input-medium-padding-top, var(--nuraly-medium-padding-top));
    padding-bottom: var(--nuraly-input-medium-padding-bottom, var(--nuraly-medium-padding-bottom));
    padding-left: var(--nuraly-input-medium-padding-left, var(--nuraly-medium-padding-left));
    padding-right: var(--nuraly-input-medium-padding-right, var(--nuraly-medium-padding-right));
  }

  /* Small input size variant */
  div[data-size='small'] {
    padding-top: var(--nuraly-input-small-padding-top, var(--nuraly-small-padding-top));
    padding-bottom: var(--nuraly-input-small-padding-bottom, var(--nuraly-small-padding-bottom));
    padding-left: var(--nuraly-input-small-padding-left, var(--nuraly-small-padding-left));
    padding-right: var(--nuraly-input-small-padding-right, var(--nuraly-small-padding-right));
  }

  /* Carbon Design System - Size-specific padding overrides */
  html[data-theme^="carbon"] nr-input div[data-size='medium'],
  body[data-theme^="carbon"] nr-input div[data-size='medium'],
  [data-theme^="carbon"] div[data-size='medium'] {
    padding: 4px 8px !important;
  }

  /* 
   * Character count display
   * Shows character count and limit information
   */
  .character-count {
    font-size: var(--nuraly-input-character-count-font-size, var(--nuraly-character-count-font-size));
    color: var(--nuraly-input-character-count-color, var(--nuraly-character-count-color));
    text-align: right;
    margin-top: var(--nuraly-input-character-count-margin-top, var(--nuraly-character-count-margin-top));
    font-family: var(--nuraly-input-font-family, var(--nuraly-font-family));
  }

  /* Character count over limit styling */
  .character-count[data-over-limit] {
    color: var(--nuraly-input-character-count-over-limit-color, var(--nuraly-character-count-over-limit-color));
  }

  /* ========================================
   * VALIDATION MESSAGE STYLES
   * ======================================== */

  /* 
   * Base validation message styling
   * Common styles for error and warning messages
   */
  .validation-message {
    font-size: var(--nuraly-input-validation-message-font-size, var(--nuraly-validation-message-font-size, 0.875rem));
    font-family: var(--nuraly-input-font-family, var(--nuraly-font-family));
    margin-top: var(--nuraly-input-validation-message-margin-top, var(--nuraly-validation-message-margin-top, 0.25rem));
    padding: var(--nuraly-input-validation-message-padding, var(--nuraly-validation-message-padding, 0));
    
    /* Prevent text overflow and ensure proper wrapping without affecting parent width */
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    white-space: normal;
    max-width: 100%;
    width: 0;
    min-width: 100%;
    box-sizing: border-box;
    line-height: var(--nuraly-input-validation-message-line-height, var(--nuraly-validation-message-line-height, 1.4));
  }

  /* 
   * Error validation message styling
   * Applied when validation message has error class
   */
  .validation-message.error {
    color: var(--nuraly-input-error-message-color, var(--nuraly-error-message-color, var(--nuraly-input-error-color, var(--nuraly-error-color, #dc2626))));
  }

  /* 
   * Warning validation message styling
   * Applied when validation message has warning class
   */
  .validation-message.warning {
    color: var(--nuraly-input-warning-message-color, var(--nuraly-warning-message-color, var(--nuraly-input-warning-color, var(--nuraly-warning-color, #d97706))));
  }

  /* 
   * Disabled state for validation messages
   * Applied when input is disabled
   */
  :host([disabled]) .validation-message {
    opacity: var(--nuraly-input-disabled-validation-message-opacity, var(--nuraly-disabled-validation-message-opacity, 0.6));
    color: var(--nuraly-input-disabled-validation-message-color, var(--nuraly-disabled-validation-message-color));
  }

  /* 
   * Validation icon styles
   * Base styles for validation feedback icons
   */
  .validation-icon {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* 
   * Loading validation icon with hourglass animation
   * Applied when async validation is in progress
   */
  .validation-icon.validation-loading {
    color: var(--nuraly-input-primary-color, var(--nuraly-primary-color, #3b82f6));
    animation: validation-hourglass 2s ease-in-out infinite;
    transform-origin: center;
  }

  /* 
   * Error validation icon styling
   * Applied when validation fails
   */
  .validation-icon.validation-error {
    color: var(--nuraly-input-error-color, var(--nuraly-error-color, #dc2626));
  }

  /* 
   * Warning validation icon styling
   * Applied when validation has warnings
   */
  .validation-icon.validation-warning {
    color: var(--nuraly-input-warning-color, var(--nuraly-warning-color, #d97706));
  }

  /* 
   * Success validation icon styling
   * Applied when validation passes
   */
  .validation-icon.validation-success {
    color: var(--nuraly-input-success-color, var(--nuraly-success-color, #16a34a));
  }

  /* 
   * Hourglass animation for validation loading
   * Gentle pulsing effect without rotation for clean appearance
   */
  @keyframes validation-hourglass {
    0% {
      opacity: 0.7;
      transform: scale(1);
    }
    25% {
      opacity: 1;
      transform: scale(1.03);
    }
    50% {
      opacity: 0.8;
      transform: scale(1);
    }
    75% {
      opacity: 1;
      transform: scale(1.03);
    }
    100% {
      opacity: 0.7;
      transform: scale(1);
    }
  }

  /* 
   * Alternative pulse animation option
   * Uncomment this and change animation above to use pulse instead of hourglass
   */
  /*
  @keyframes validation-pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }
  */
`;

export const styles = [inputStyle, sizeInputStyle];
