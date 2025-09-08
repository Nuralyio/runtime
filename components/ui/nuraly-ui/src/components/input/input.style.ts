import { css } from 'lit';
import { styleVariables } from './input.style.variable..js';

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
   * Base input container and input element styles
   * Uses CSS custom properties with fallbacks for comprehensive theming support
   * Properties follow the pattern: --hybrid-input-{property}, --hybrid-input-local-{property}
   */
  :host > #input-container,
  #input-container > input {
    background-color: var(--hybrid-input-background-color, var(--hybrid-input-local-background-color));
  }

  /* 
   * Disabled state styles for container and input
   * Applied when input is disabled - removes interactivity and applies muted colors
   */
  :host([disabled]) > #input-container,
  :host([disabled]) > #input-container > input {
    background-color: var(--hybrid-input-disabled-background-color, var(--hybrid-input-local-disabled-background-color));
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
  :host([disabled]) #copy-icon {
    opacity: var(--hybrid-input-disabled-icon-opacity, var(--hybrid-input-local-disabled-icon-opacity));
  }

  /* Disabled icons cursor override */
  :host([disabled]) #password-icon,
  :host([disabled]) #number-icons,
  :host([disabled]) #copy-icon {
    cursor: not-allowed;
  }

  /* ========================================
   * INPUT CONTAINER STYLES
   * ======================================== */

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
`;

export const styles = [inputStyle, sizeInputStyle, styleVariables];
