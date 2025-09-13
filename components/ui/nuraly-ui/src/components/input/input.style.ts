import { css } from 'lit';
import { styleVariables } from './input.style.variable.js';

/**
 * Input component styles for the Hybrid UI Library
 * 
 * This file contains all the styling for the nr-input component, including:
 * - Base input styles with CSS custom properties for theming
 * - Multiple input states (default, warning, error)
 * - Size variations (small, medium, large)
 * - Different input types (text, password, number, calendar)
 * - Icon positioning and styling
 * - Focus, disabled, and validation states
 * - Dark theme support
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
    font-family: var(--nuraly-input-font-family, var(--nuraly-input-local-font-family));
  }

  /* 
   * Base input wrapper and input element styles
   * Background applied to wrapper to cover entire container including addons
   * Uses CSS custom properties with fallbacks for comprehensive theming support
   * Properties follow the pattern: --nuraly-input-{property}, --nuraly-input-local-{property}
   */
  .input-wrapper {
    background-color: var(--nuraly-input-background-color, var(--nuraly-input-local-background-color));
  }

  #input-container > input {
    background-color: transparent;
  }

  /* 
   * Disabled state styles for wrapper and input
   * Applied when input is disabled - removes interactivity and applies muted colors
   */
  :host([disabled]) .input-wrapper {
    background-color: var(--nuraly-input-disabled-background-color, var(--nuraly-input-local-disabled-background-color));
  }

  :host([disabled]) #input-container > input {
    background-color: transparent;
    cursor: not-allowed;
  }

  /* 
   * Icon base styles
   * Common styling for all icons within the input component
   */
  nr-icon {
    display: flex;
    align-items: center;
  }

  /* 
   * Placeholder styling
   * Customizable placeholder text appearance
   */
  ::placeholder {
    color: var(--nuraly-input-placeholder-color, var(--nuraly-input-local-placeholder-color));
    font-size: var(--nuraly-input-placeholder-font-size, var(--nuraly-input-local-placeholder-font-size));
    font-family: var(--nuraly-input-font-family, var(--nuraly-input-local-font-family));
  }

  /* 
   * Disabled placeholder styling
   * Applied when input is disabled
   */
  :host([disabled]) ::placeholder {
    color: var(--nuraly-input-disabled-placeholder-color, var(--nuraly-input-local-disabled-placeholder-color));
  }

  /* ========================================
   * ICON VARIANTS AND STATES
   * ======================================== */

  /* Warning state icon */
  #warning-icon {
    --nuraly-icon-color: var(--nuraly-input-warning-icon-color, var(--nuraly-input-local-warning-icon-color));
  }

  /* Error state icon */
  #error-icon {
    --nuraly-icon-color: var(--nuraly-input-error-icon-color, var(--nuraly-input-local-error-icon-color));
  }

  /* Calendar input type icon */
  #calendar-icon {
    --nuraly-icon-color: var(--nuraly-input-calendar-icon-color, var(--nuraly-input-local-calendar-icon-color));
  }

  /* Password toggle icon */
  #password-icon {
    padding-left: var(--nuraly-input-password-icon-padding-left, var(--nuraly-input-local-password-icon-padding-left));
    padding-right: var(--nuraly-input-password-icon-padding-right, var(--nuraly-input-local-password-icon-padding-right));
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-input-password-icon-color, var(--nuraly-input-local-password-icon-color));
  }

  /* Copy functionality icon */
  #copy-icon {
    padding-right: var(--nuraly-input-copy-icon-padding-right, var(--nuraly-input-local-copy-icon-padding-right));
    --nuraly-icon-color: var(--nuraly-input-copy-icon-color, var(--nuraly-input-local-copy-icon-color));
    cursor: pointer;
  }

  /* Clear functionality icon */
  #clear-icon {
    padding-right: var(--nuraly-input-clear-icon-padding-right, var(--nuraly-input-local-clear-icon-padding-right));
    --nuraly-icon-color: var(--nuraly-input-clear-icon-color, var(--nuraly-input-local-clear-icon-color));
    cursor: pointer;
  }

  /* 
   * Number input increment/decrement icons container
   * Positioned absolutely for overlay on input
   */
  #number-icons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: var(--nuraly-input-number-icons-container-width, var(--nuraly-input-local-number-icons-container-width));
    padding-right: var(--nuraly-input-number-icons-container-padding-right, var(--nuraly-input-local-number-icons-container-padding-right));
  }

  /* Individual number icons styling */
  #number-icons nr-icon {
    --nuraly-icon-color: var(--nuraly-input-number-icons-color, var(--nuraly-input-local-number-icons-color));
    padding-left: var(--nuraly-input-number-icons-padding-left, var(--nuraly-input-local-number-icons-padding-left));
    padding-right: var(--nuraly-input-number-icons-padding-right, var(--nuraly-input-local-number-icons-padding-right));
    width: var(--nuraly-input-number-icons-width, var(--nuraly-input-local-number-icons-width));
    height: var(--nuraly-input-number-icons-height, var(--nuraly-input-local-number-icons-height));
  }

  /* Number icons separator styling */
  #icons-separator {
    color: var(--nuraly-input-number-icons-separator-color, var(--nuraly-input-local-number-icons-separator-color));
    padding-bottom: var(--nuraly-input-number-icons-separator-padding-bottom, var(--nuraly-input-local-number-icons-separator-padding-bottom));
    padding-left: var(--nuraly-input-number-icons-separator-padding-left, var(--nuraly-input-local-number-icons-separator-padding-left));
    padding-right: var(--nuraly-input-number-icons-separator-padding-right, var(--nuraly-input-local-number-icons-separator-padding-right));
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
    opacity: var(--nuraly-input-disabled-icon-opacity, var(--nuraly-input-local-disabled-icon-opacity));
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
    background-color: var(--nuraly-input-addon-background-color, var(--nuraly-input-local-addon-background-color));
    border: var(--nuraly-input-border, var(--nuraly-input-local-border));
    border-right: none;
    border-top-left-radius: var(--nuraly-input-border-radius, var(--nuraly-input-local-border-radius));
    border-bottom-left-radius: var(--nuraly-input-border-radius, var(--nuraly-input-local-border-radius));
    padding: var(--nuraly-input-addon-padding, var(--nuraly-input-local-addon-padding));
    display: flex;
    align-items: center;
    color: var(--nuraly-input-addon-color, var(--nuraly-input-local-addon-color));
    font-size: var(--nuraly-input-font-size, var(--nuraly-input-local-font-size));
    white-space: nowrap;
    min-width: 0; /* Allow shrinking */
    flex-shrink: 0; /* Prevent shrinking */
  }

  /* 
   * Addon after element - content after input (outside borders)
   * Styled to visually connect with input
   */
  .input-addon-after {
    background-color: var(--nuraly-input-addon-background-color, var(--nuraly-input-local-addon-background-color));
    border: var(--nuraly-input-border, var(--nuraly-input-local-border));
    border-left: none;
    border-top-right-radius: var(--nuraly-input-border-radius, var(--nuraly-input-local-border-radius));
    border-bottom-right-radius: var(--nuraly-input-border-radius, var(--nuraly-input-local-border-radius));
    padding: var(--nuraly-input-addon-padding, var(--nuraly-input-local-addon-padding));
    display: flex;
    align-items: center;
    color: var(--nuraly-input-addon-color, var(--nuraly-input-local-addon-color));
    font-size: var(--nuraly-input-font-size, var(--nuraly-input-local-font-size));
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
   * Uses CSS custom properties for comprehensive border and layout control
   */
  #input-container {
    /* Border properties - individual sides for granular control */
    border-bottom: var(--nuraly-input-border-bottom, var(--nuraly-input-local-border-bottom));
    border-top: var(--nuraly-input-border-top, var(--nuraly-input-local-border-top));
    border-left: var(--nuraly-input-border-left, var(--nuraly-input-local-border-left));
    border-right: var(--nuraly-input-border-right, var(--nuraly-input-local-border-right));
    
    /* Border radius - individual corners for design flexibility */
    border-radius: var(--nuraly-input-border-radius, var(--nuraly-input-local-border-radius)); 
    border-top-left-radius: var(--nuraly-input-border-top-left-radius, var(--nuraly-input-local-border-top-left-radius));
    border-top-right-radius: var(--nuraly-input-border-top-right-radius, var(--nuraly-input-local-border-top-right-radius));
    border-bottom-left-radius: var(--nuraly-input-border-bottom-left-radius, var(--nuraly-input-local-border-bottom-left-radius));
    border-bottom-right-radius: var(--nuraly-input-border-bottom-right-radius, var(--nuraly-input-local-border-bottom-right-radius));
    
    /* Layout */
    display: flex;
    position: relative;
    flex: 1; /* Take available space in wrapper */
    min-width: 0; /* Allow shrinking below content size */
  }

  /* 
   * Disabled container border styles
   * Applied when input is disabled
   */
  :host([disabled]) #input-container {
    border-bottom: var(--nuraly-input-disabled-border-bottom, var(--nuraly-input-local-disabled-border-bottom));
    border-top: var(--nuraly-input-disabled-border-top, var(--nuraly-input-local-disabled-border-top));
    border-left: var(--nuraly-input-disabled-border-left, var(--nuraly-input-local-disabled-border-left));
    border-right: var(--nuraly-input-disabled-border-right, var(--nuraly-input-local-disabled-border-right));
    opacity: 0.6;
  }

  /* ========================================
   * INPUT VARIANT STYLES
   * ======================================== */

  /* 
   * Outlined variant - full border around input
   * Default: light border, focus: blue border
   */
  :host([variant='outlined']) #input-container {
    border: var(--nuraly-input-outlined-border, var(--nuraly-input-local-outlined-border));
    border-radius: var(--nuraly-input-outlined-border-radius, var(--nuraly-input-local-outlined-border-radius));
    background-color: var(--nuraly-input-outlined-background, var(--nuraly-input-local-outlined-background));
  }

  :host([variant='outlined']) .input-wrapper {
    background-color: transparent;
  }

  :host([variant='outlined']:not([state='error'])) #input-container:focus-within {
    border: var(--nuraly-input-outlined-focus-border, var(--nuraly-input-local-outlined-focus-border));
  }

  /* 
   * Filled variant - background with bottom border only
   * Subtle background with bottom border indication
   */
  :host([variant='filled']) #input-container {
    background-color: var(--nuraly-input-filled-background, var(--nuraly-input-local-filled-background));
    border-radius: var(--nuraly-input-filled-border-radius, var(--nuraly-input-local-filled-border-radius));
    border-bottom: var(--nuraly-input-filled-border-bottom, var(--nuraly-input-local-filled-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
  }

  :host([variant='filled']) .input-wrapper {
    background-color: transparent;
  }

  :host([variant='filled']:not([state='error'])) #input-container:focus-within {
    border-bottom: var(--nuraly-input-filled-focus-border-bottom, var(--nuraly-input-local-filled-focus-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
  }

  /* 
   * Borderless variant - no borders, focus with outline
   * Clean appearance with focus indication via outline
   */
  :host([variant='borderless']) #input-container {
    background-color: var(--nuraly-input-borderless-background, var(--nuraly-input-local-borderless-background));
    border: none;
    border-radius: var(--nuraly-input-borderless-border-radius, var(--nuraly-input-local-borderless-border-radius));
  }

  :host([variant='borderless']) .input-wrapper {
    background-color: transparent;
  }

  :host([variant='borderless']:not([state='error'])) #input-container:focus-within {
    outline: var(--nuraly-input-borderless-focus-outline, var(--nuraly-input-local-borderless-focus-outline));
    border: none;
  }

  /* 
   * Underlined variant - bottom border only (default/current behavior)
   * Maintains existing behavior as default
   */
  :host([variant='underlined']) #input-container {
    border-bottom: var(--nuraly-input-underlined-border-bottom, var(--nuraly-input-local-underlined-border-bottom));
    border-top: none;
    border-left: none;
    border-right: none;
    border-radius: 0;
  }

  :host([variant='underlined']:not([state='error'])) #input-container:focus-within {
    border-bottom: var(--nuraly-input-underlined-focus-border-bottom, var(--nuraly-input-local-underlined-focus-border-bottom));
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
    color: var(--nuraly-input-text-color, var(--nuraly-input-local-text-color));
    font-family: var(--nuraly-input-font-family, var(--nuraly-input-local-font-family));
    font-size: var(--nuraly-input-font-size, var(--nuraly-input-local-font-size));
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
    border: var(--nuraly-input-error-border, var(--nuraly-input-local-error-border)) !important;
    outline: none !important;
  }

  /* Override variant-specific error state styling */
  :host([variant='borderless'][state='error']) #input-container {
    border: var(--nuraly-input-error-border, var(--nuraly-input-local-error-border)) !important;
    outline: none !important;
  }

  :host([variant='underlined'][state='error']) #input-container,
  :host([variant='filled'][state='error']) #input-container {
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: var(--nuraly-input-error-border, var(--nuraly-input-local-error-border)) !important;
  }

  /* 
   * Number input icon positioning adjustments for error/warning states
   * When validation states are present, adjust icon positioning
   */
  :host([state='error']) input[type='number'] ~ #number-icons,
  :host([state='warning']) input[type='number'] ~ #number-icons {
    position: static;
    padding-left: var(--nuraly-input-number-icons-container-padding-left, var(--nuraly-input-local-number-icons-container-padding-left));
  }

  /* ========================================
   * SLOTTED CONTENT STYLES
   * ======================================== */

  /* 
   * Label slot styling
   * Applied to slotted label elements
   */
  ::slotted([slot='label']) {
    color: var(--nuraly-input-label-color, var(--nuraly-input-local-label-color));
    font-size: var(--nuraly-input-label-font-size, var(--nuraly-input-local-label-font-size));
    padding-bottom: var(--nuraly-input-label-padding-bottom, var(--nuraly-input-local-label-padding-bottom));
  }

  /* 
   * Helper text slot styling
   * Applied to slotted helper text elements
   */
  ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-helper-text-color, var(--nuraly-input-local-helper-text-color));
    font-size: var(--nuraly-input-helper-text-font-size, var(--nuraly-input-local-helper-text-font-size));
    padding-top: var(--nuraly-input-helper-text-padding-top, var(--nuraly-input-local-helper-text-padding-top));
    
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
    color: var(--nuraly-input-error-helper-text-color, var(--nuraly-input-local-error-helper-text-color));
  }

  :host([state='warning']) ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-warning-helper-text-color, var(--nuraly-input-local-warning-helper-text-color));
  }

  /* 
   * Disabled state for slotted content
   * Applied when input is disabled
   */
  :host([disabled]) ::slotted([slot='helper-text']) {
    color: var(--nuraly-input-disabled-helper-text-color, var(--nuraly-input-local-disabled-helper-text-color));
  }

  :host([disabled]) ::slotted([slot='label']) {
    color: var(--nuraly-input-disabled-label-color, var(--nuraly-input-local-disabled-label-color));
  }

  /* 
   * Prefix slot styling
   * Applied to slotted prefix content (icons, text, etc.)
   */
  ::slotted([slot='prefix']) {
    display: flex;
    align-items: center;
    padding-right: var(--nuraly-input-prefix-padding-right, var(--nuraly-input-local-prefix-padding-right));
    color: var(--nuraly-input-prefix-color, var(--nuraly-input-local-prefix-color));
    font-size: var(--nuraly-input-prefix-font-size, var(--nuraly-input-local-prefix-font-size));
    flex-shrink: 0;
  }

  /* 
   * Suffix slot styling
   * Applied to slotted suffix content (icons, text, etc.)
   */
  ::slotted([slot='suffix']) {
    display: flex;
    align-items: center;
    padding-left: var(--nuraly-input-suffix-padding-left, var(--nuraly-input-local-suffix-padding-left));
    color: var(--nuraly-input-suffix-color, var(--nuraly-input-local-suffix-color));
    font-size: var(--nuraly-input-suffix-font-size, var(--nuraly-input-local-suffix-font-size));
    flex-shrink: 0;
  }

  /* 
   * Disabled state for prefix and suffix slots
   * Applied when input is disabled
   */
  :host([disabled]) ::slotted([slot='prefix']),
  :host([disabled]) ::slotted([slot='suffix']) {
    opacity: var(--nuraly-input-disabled-icon-opacity, var(--nuraly-input-local-disabled-icon-opacity));
    color: var(--nuraly-input-disabled-prefix-suffix-color, var(--nuraly-input-local-disabled-prefix-suffix-color));
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
    padding-top: var(--nuraly-input-large-padding-top, var(--nuraly-input-local-large-padding-top));
    padding-bottom: var(--nuraly-input-large-padding-bottom, var(--nuraly-input-local-large-padding-bottom));
    padding-left: var(--nuraly-input-large-padding-left, var(--nuraly-input-local-large-padding-left));
    padding-right: var(--nuraly-input-large-padding-right, var(--nuraly-input-local-large-padding-right));
  }

  /* Medium input size variant (default) */
  div[data-size='medium'] {
    padding-top: var(--nuraly-input-medium-padding-top, var(--nuraly-input-local-medium-padding-top));
    padding-bottom: var(--nuraly-input-medium-padding-bottom, var(--nuraly-input-local-medium-padding-bottom));
    padding-left: var(--nuraly-input-medium-padding-left, var(--nuraly-input-local-medium-padding-left));
    padding-right: var(--nuraly-input-medium-padding-right, var(--nuraly-input-local-medium-padding-right));
  }

  /* Small input size variant */
  div[data-size='small'] {
    padding-top: var(--nuraly-input-small-padding-top, var(--nuraly-input-local-small-padding-top));
    padding-bottom: var(--nuraly-input-small-padding-bottom, var(--nuraly-input-local-small-padding-bottom));
    padding-left: var(--nuraly-input-small-padding-left, var(--nuraly-input-local-small-padding-left));
    padding-right: var(--nuraly-input-small-padding-right, var(--nuraly-input-local-small-padding-right));
  }

  /* 
   * Character count display
   * Shows character count and limit information
   */
  .character-count {
    font-size: var(--nuraly-input-character-count-font-size, var(--nuraly-input-local-character-count-font-size));
    color: var(--nuraly-input-character-count-color, var(--nuraly-input-local-character-count-color));
    text-align: right;
    margin-top: var(--nuraly-input-character-count-margin-top, var(--nuraly-input-local-character-count-margin-top));
    font-family: var(--nuraly-input-font-family, var(--nuraly-input-local-font-family));
  }

  /* Character count over limit styling */
  .character-count[data-over-limit] {
    color: var(--nuraly-input-character-count-over-limit-color, var(--nuraly-input-local-character-count-over-limit-color));
  }

  /* ========================================
   * VALIDATION MESSAGE STYLES
   * ======================================== */

  /* 
   * Base validation message styling
   * Common styles for error and warning messages
   */
  .validation-message {
    font-size: var(--nuraly-input-validation-message-font-size, var(--nuraly-input-local-validation-message-font-size, 0.875rem));
    font-family: var(--nuraly-input-font-family, var(--nuraly-input-local-font-family));
    margin-top: var(--nuraly-input-validation-message-margin-top, var(--nuraly-input-local-validation-message-margin-top, 0.25rem));
    padding: var(--nuraly-input-validation-message-padding, var(--nuraly-input-local-validation-message-padding, 0));
    
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
    line-height: var(--nuraly-input-validation-message-line-height, var(--nuraly-input-local-validation-message-line-height, 1.4));
  }

  /* 
   * Error validation message styling
   * Applied when validation message has error class
   */
  .validation-message.error {
    color: var(--nuraly-input-error-message-color, var(--nuraly-input-local-error-message-color, var(--nuraly-input-error-color, var(--nuraly-input-local-error-color, #dc2626))));
  }

  /* 
   * Warning validation message styling
   * Applied when validation message has warning class
   */
  .validation-message.warning {
    color: var(--nuraly-input-warning-message-color, var(--nuraly-input-local-warning-message-color, var(--nuraly-input-warning-color, var(--nuraly-input-local-warning-color, #d97706))));
  }

  /* 
   * Disabled state for validation messages
   * Applied when input is disabled
   */
  :host([disabled]) .validation-message {
    opacity: var(--nuraly-input-disabled-validation-message-opacity, var(--nuraly-input-local-disabled-validation-message-opacity, 0.6));
    color: var(--nuraly-input-disabled-validation-message-color, var(--nuraly-input-local-disabled-validation-message-color));
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
    color: var(--nuraly-input-primary-color, var(--nuraly-input-local-primary-color, #3b82f6));
    animation: validation-hourglass 2s ease-in-out infinite;
    transform-origin: center;
  }

  /* 
   * Error validation icon styling
   * Applied when validation fails
   */
  .validation-icon.validation-error {
    color: var(--nuraly-input-error-color, var(--nuraly-input-local-error-color, #dc2626));
  }

  /* 
   * Warning validation icon styling
   * Applied when validation has warnings
   */
  .validation-icon.validation-warning {
    color: var(--nuraly-input-warning-color, var(--nuraly-input-local-warning-color, #d97706));
  }

  /* 
   * Success validation icon styling
   * Applied when validation passes
   */
  .validation-icon.validation-success {
    color: var(--nuraly-input-success-color, var(--nuraly-input-local-success-color, #16a34a));
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

export const styles = [inputStyle, sizeInputStyle, styleVariables];
