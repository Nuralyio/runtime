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
    font-family: var(--hybrid-input-font-family, var(--hybrid-input-local-font-family));
  }

  /* 
   * Base input wrapper and input element styles
   * Background applied to wrapper to cover entire container including addons
   * Uses CSS custom properties with fallbacks for comprehensive theming support
   * Properties follow the pattern: --hybrid-input-{property}, --hybrid-input-local-{property}
   */
  .input-wrapper {
    background-color: var(--hybrid-input-background-color, var(--hybrid-input-local-background-color));
  }

  #input-container > input {
    background-color: transparent;
  }

  /* 
   * Disabled state styles for wrapper and input
   * Applied when input is disabled - removes interactivity and applies muted colors
   */
  :host([disabled]) .input-wrapper {
    background-color: var(--hybrid-input-disabled-background-color, var(--hybrid-input-local-disabled-background-color));
  }

  :host([disabled]) #input-container > input {
    background-color: transparent;
    cursor: not-allowed;
  }

  /* 
   * Icon base styles
   * Common styling for all icons within the input component
   */
  hy-icon {
    display: flex;
    align-items: center;
  }

  /* 
   * Placeholder styling
   * Customizable placeholder text appearance
   */
  ::placeholder {
    color: var(--hybrid-input-placeholder-color, var(--hybrid-input-local-placeholder-color));
    font-size: var(--hybrid-input-placeholder-font-size, var(--hybrid-input-local-placeholder-font-size));
    font-family: var(--hybrid-input-font-family, var(--hybrid-input-local-font-family));
  }

  /* 
   * Disabled placeholder styling
   * Applied when input is disabled
   */
  :host([disabled]) ::placeholder {
    color: var(--hybrid-input-disabled-placeholder-color, var(--hybrid-input-local-disabled-placeholder-color));
  }

  /* ========================================
   * ICON VARIANTS AND STATES
   * ======================================== */

  /* Warning state icon */
  #warning-icon {
    --hybrid-icon-color: var(--hybrid-input-warning-icon-color, var(--hybrid-input-local-warning-icon-color));
  }

  /* Error state icon */
  #error-icon {
    --hybrid-icon-color: var(--hybrid-input-error-icon-color, var(--hybrid-input-local-error-icon-color));
  }

  /* Calendar input type icon */
  #calendar-icon {
    --hybrid-icon-color: var(--hybrid-input-calendar-icon-color, var(--hybrid-input-local-calendar-icon-color));
  }

  /* Password toggle icon */
  #password-icon {
    padding-left: var(--hybrid-input-password-icon-padding-left, var(--hybrid-input-local-password-icon-padding-left));
    padding-right: var(--hybrid-input-password-icon-padding-right, var(--hybrid-input-local-password-icon-padding-right));
    cursor: pointer;
    --hybrid-icon-color: var(--hybrid-input-password-icon-color, var(--hybrid-input-local-password-icon-color));
  }

  /* Copy functionality icon */
  #copy-icon {
    padding-right: var(--hybrid-input-copy-icon-padding-right, var(--hybrid-input-local-copy-icon-padding-right));
    --hybrid-icon-color: var(--hybrid-input-copy-icon-color, var(--hybrid-input-local-copy-icon-color));
    cursor: pointer;
  }

  /* Clear functionality icon */
  #clear-icon {
    padding-right: var(--hybrid-input-clear-icon-padding-right, var(--hybrid-input-local-clear-icon-padding-right));
    --hybrid-icon-color: var(--hybrid-input-clear-icon-color, var(--hybrid-input-local-clear-icon-color));
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
    width: var(--hybrid-input-number-icons-container-width, var(--hybrid-input-local-number-icons-container-width));
    padding-right: var(--hybrid-input-number-icons-container-padding-right, var(--hybrid-input-local-number-icons-container-padding-right));
  }

  /* Individual number icons styling */
  #number-icons hy-icon {
    --hybrid-icon-color: var(--hybrid-input-number-icons-color, var(--hybrid-input-local-number-icons-color));
    padding-left: var(--hybrid-input-number-icons-padding-left, var(--hybrid-input-local-number-icons-padding-left));
    padding-right: var(--hybrid-input-number-icons-padding-right, var(--hybrid-input-local-number-icons-padding-right));
    width: var(--hybrid-input-number-icons-width, var(--hybrid-input-local-number-icons-width));
    height: var(--hybrid-input-number-icons-height, var(--hybrid-input-local-number-icons-height));
  }

  /* Number icons separator styling */
  #icons-separator {
    color: var(--hybrid-input-number-icons-separator-color, var(--hybrid-input-local-number-icons-separator-color));
    padding-bottom: var(--hybrid-input-number-icons-separator-padding-bottom, var(--hybrid-input-local-number-icons-separator-padding-bottom));
    padding-left: var(--hybrid-input-number-icons-separator-padding-left, var(--hybrid-input-local-number-icons-separator-padding-left));
    padding-right: var(--hybrid-input-number-icons-separator-padding-right, var(--hybrid-input-local-number-icons-separator-padding-right));
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
    opacity: var(--hybrid-input-disabled-icon-opacity, var(--hybrid-input-local-disabled-icon-opacity));
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
    background-color: var(--hybrid-input-addon-background-color, var(--hybrid-input-local-addon-background-color));
    border: var(--hybrid-input-border, var(--hybrid-input-local-border));
    border-right: none;
    border-top-left-radius: var(--hybrid-input-border-radius, var(--hybrid-input-local-border-radius));
    border-bottom-left-radius: var(--hybrid-input-border-radius, var(--hybrid-input-local-border-radius));
    padding: var(--hybrid-input-addon-padding, var(--hybrid-input-local-addon-padding));
    display: flex;
    align-items: center;
    color: var(--hybrid-input-addon-color, var(--hybrid-input-local-addon-color));
    font-size: var(--hybrid-input-font-size, var(--hybrid-input-local-font-size));
    white-space: nowrap;
    min-width: 0; /* Allow shrinking */
    flex-shrink: 0; /* Prevent shrinking */
  }

  /* 
   * Addon after element - content after input (outside borders)
   * Styled to visually connect with input
   */
  .input-addon-after {
    background-color: var(--hybrid-input-addon-background-color, var(--hybrid-input-local-addon-background-color));
    border: var(--hybrid-input-border, var(--hybrid-input-local-border));
    border-left: none;
    border-top-right-radius: var(--hybrid-input-border-radius, var(--hybrid-input-local-border-radius));
    border-bottom-right-radius: var(--hybrid-input-border-radius, var(--hybrid-input-local-border-radius));
    padding: var(--hybrid-input-addon-padding, var(--hybrid-input-local-addon-padding));
    display: flex;
    align-items: center;
    color: var(--hybrid-input-addon-color, var(--hybrid-input-local-addon-color));
    font-size: var(--hybrid-input-font-size, var(--hybrid-input-local-font-size));
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
    border-bottom: var(--hybrid-input-border-bottom, var(--hybrid-input-local-border-bottom));
    border-top: var(--hybrid-input-border-top, var(--hybrid-input-local-border-top));
    border-left: var(--hybrid-input-border-left, var(--hybrid-input-local-border-left));
    border-right: var(--hybrid-input-border-right, var(--hybrid-input-local-border-right));
    
    /* Border radius - individual corners for design flexibility */
    border-radius: var(--hybrid-input-border-radius, var(--hybrid-input-local-border-radius)); 
    border-top-left-radius: var(--hybrid-input-border-top-left-radius, var(--hybrid-input-local-border-top-left-radius));
    border-top-right-radius: var(--hybrid-input-border-top-right-radius, var(--hybrid-input-local-border-top-right-radius));
    border-bottom-left-radius: var(--hybrid-input-border-bottom-left-radius, var(--hybrid-input-local-border-bottom-left-radius));
    border-bottom-right-radius: var(--hybrid-input-border-bottom-right-radius, var(--hybrid-input-local-border-bottom-right-radius));
    
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
    border-bottom: var(--hybrid-input-disabled-border-bottom, var(--hybrid-input-local-disabled-border-bottom));
    border-top: var(--hybrid-input-disabled-border-top, var(--hybrid-input-local-disabled-border-top));
    border-left: var(--hybrid-input-disabled-border-left, var(--hybrid-input-local-disabled-border-left));
    border-right: var(--hybrid-input-disabled-border-right, var(--hybrid-input-local-disabled-border-right));
    opacity: 0.6;
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
    color: var(--hybrid-input-text-color, var(--hybrid-input-local-text-color));
    font-family: var(--hybrid-input-font-family, var(--hybrid-input-local-font-family));
    font-size: var(--hybrid-input-font-size, var(--hybrid-input-local-font-size));
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
   * Error state styling
   * Applied when state='error' and not disabled
   */
  :host(:not([disabled])[state='error']) > #input-container {
    border: var(--hybrid-input-error-border, var(--hybrid-input-local-error-border));
  }

  /* 
   * Focus state styling
   * Applied when input receives focus and not in error state
   */
  :host(:not([state='error'])) > #input-container:focus-within {
    border: var(--hybrid-input-focus-border, var(--hybrid-input-local-focus-border));
  }

  /* 
   * Number input icon positioning adjustments for error/warning states
   * When validation states are present, adjust icon positioning
   */
  :host([state='error']) input[type='number'] ~ #number-icons,
  :host([state='warning']) input[type='number'] ~ #number-icons {
    position: static;
    padding-left: var(--hybrid-input-number-icons-container-padding-left, var(--hybrid-input-local-number-icons-container-padding-left));
  }

  /* ========================================
   * SLOTTED CONTENT STYLES
   * ======================================== */

  /* 
   * Label slot styling
   * Applied to slotted label elements
   */
  ::slotted([slot='label']) {
    color: var(--hybrid-input-label-color, var(--hybrid-input-local-label-color));
    font-size: var(--hybrid-input-label-font-size, var(--hybrid-input-local-label-font-size));
    padding-bottom: var(--hybrid-input-label-padding-bottom, var(--hybrid-input-local-label-padding-bottom));
  }

  /* 
   * Helper text slot styling
   * Applied to slotted helper text elements
   */
  ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-helper-text-color, var(--hybrid-input-local-helper-text-color));
    font-size: var(--hybrid-input-helper-text-font-size, var(--hybrid-input-local-helper-text-font-size));
    padding-top: var(--hybrid-input-helper-text-padding-top, var(--hybrid-input-local-helper-text-padding-top));
  }

  /* 
   * State-specific helper text colors
   * Override helper text color based on validation state
   */
  :host([state='error']) ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-error-helper-text-color, var(--hybrid-input-local-error-helper-text-color));
  }

  :host([state='warning']) ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-warning-helper-text-color, var(--hybrid-input-local-warning-helper-text-color));
  }

  /* 
   * Disabled state for slotted content
   * Applied when input is disabled
   */
  :host([disabled]) ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-disabled-helper-text-color, var(--hybrid-input-local-disabled-helper-text-color));
  }

  :host([disabled]) ::slotted([slot='label']) {
    color: var(--hybrid-input-disabled-label-color, var(--hybrid-input-local-disabled-label-color));
  }

  /* 
   * Prefix slot styling
   * Applied to slotted prefix content (icons, text, etc.)
   */
  ::slotted([slot='prefix']) {
    display: flex;
    align-items: center;
    padding-right: var(--hybrid-input-prefix-padding-right, var(--hybrid-input-local-prefix-padding-right));
    color: var(--hybrid-input-prefix-color, var(--hybrid-input-local-prefix-color));
    font-size: var(--hybrid-input-prefix-font-size, var(--hybrid-input-local-prefix-font-size));
    flex-shrink: 0;
  }

  /* 
   * Suffix slot styling
   * Applied to slotted suffix content (icons, text, etc.)
   */
  ::slotted([slot='suffix']) {
    display: flex;
    align-items: center;
    padding-left: var(--hybrid-input-suffix-padding-left, var(--hybrid-input-local-suffix-padding-left));
    color: var(--hybrid-input-suffix-color, var(--hybrid-input-local-suffix-color));
    font-size: var(--hybrid-input-suffix-font-size, var(--hybrid-input-local-suffix-font-size));
    flex-shrink: 0;
  }

  /* 
   * Disabled state for prefix and suffix slots
   * Applied when input is disabled
   */
  :host([disabled]) ::slotted([slot='prefix']),
  :host([disabled]) ::slotted([slot='suffix']) {
    opacity: var(--hybrid-input-disabled-icon-opacity, var(--hybrid-input-local-disabled-icon-opacity));
    color: var(--hybrid-input-disabled-prefix-suffix-color, var(--hybrid-input-local-disabled-prefix-suffix-color));
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
    padding-top: var(--hybrid-input-large-padding-top, var(--hybrid-input-local-large-padding-top));
    padding-bottom: var(--hybrid-input-large-padding-bottom, var(--hybrid-input-local-large-padding-bottom));
    padding-left: var(--hybrid-input-large-padding-left, var(--hybrid-input-local-large-padding-left));
    padding-right: var(--hybrid-input-large-padding-right, var(--hybrid-input-local-large-padding-right));
  }

  /* Medium input size variant (default) */
  div[data-size='medium'] {
    padding-top: var(--hybrid-input-medium-padding-top, var(--hybrid-input-local-medium-padding-top));
    padding-bottom: var(--hybrid-input-medium-padding-bottom, var(--hybrid-input-local-medium-padding-bottom));
    padding-left: var(--hybrid-input-medium-padding-left, var(--hybrid-input-local-medium-padding-left));
    padding-right: var(--hybrid-input-medium-padding-right, var(--hybrid-input-local-medium-padding-right));
  }

  /* Small input size variant */
  div[data-size='small'] {
    padding-top: var(--hybrid-input-small-padding-top, var(--hybrid-input-local-small-padding-top));
    padding-bottom: var(--hybrid-input-small-padding-bottom, var(--hybrid-input-local-small-padding-bottom));
    padding-left: var(--hybrid-input-small-padding-left, var(--hybrid-input-local-small-padding-left));
    padding-right: var(--hybrid-input-small-padding-right, var(--hybrid-input-local-small-padding-right));
  }

  /* 
   * Character count display
   * Shows character count and limit information
   */
  .character-count {
    font-size: var(--hybrid-input-character-count-font-size, var(--hybrid-input-local-character-count-font-size));
    color: var(--hybrid-input-character-count-color, var(--hybrid-input-local-character-count-color));
    text-align: right;
    margin-top: var(--hybrid-input-character-count-margin-top, var(--hybrid-input-local-character-count-margin-top));
    font-family: var(--hybrid-input-font-family, var(--hybrid-input-local-font-family));
  }

  /* Character count over limit styling */
  .character-count[data-over-limit] {
    color: var(--hybrid-input-character-count-over-limit-color, var(--hybrid-input-local-character-count-over-limit-color));
  }
`;

export const styles = [inputStyle, sizeInputStyle, styleVariables];
