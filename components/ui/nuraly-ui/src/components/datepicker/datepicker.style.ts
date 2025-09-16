import { css } from 'lit';
import { styleVariables } from './datepicker.style.variables.js';

/**
 * Datepicker component styles for the Hybrid UI Library
 * 
 * This file contains all the styling for the nr-datepicker component, including:
 * - Base datepicker styles with CSS custom properties for theming
 * - Multiple datepicker states (default, disabled, focused)
 * - Size variations (small, medium, large)
 * - Calendar styling and positioning
 * - Date selection states and range highlighting
 * - Focus, disabled, and validation states
 * - Dark theme support
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of datepicker appearance.
 */

export const styles = css`
  ${styleVariables}

  :host {
    width: fit-content;
    display: block;
    font-family: var(--nuraly-datepicker-font-family, var(--nuraly-datepicker-local-font-family));
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--nuraly-datepicker-disabled-opacity, var(--nuraly-datepicker-local-disabled-opacity));
    pointer-events: none;
  }

  :host([range]) {
    --nuraly-datepicker-local-calendar-width: 600px;
  }

  /* Container styles */
  .datepicker-container {
    position: relative;
    display: block;
    width: var(--nuraly-datepicker-width, var(--nuraly-datepicker-local-width));
    font-family: var(--nuraly-datepicker-font-family, var(--nuraly-datepicker-local-font-family));
    /* Allow calendar to overflow container without causing scroll */
    overflow: visible;
  }

  .datepicker-disabled {
    opacity: var(--nuraly-datepicker-disabled-opacity, var(--nuraly-datepicker-local-disabled-opacity));
    pointer-events: none;
  }

  /* Size variants */
  .datepicker-size-small {
    --nuraly-datepicker-local-day-size: var(--nuraly-datepicker-local-small-day-size);
    --nuraly-datepicker-local-font-size: var(--nuraly-datepicker-local-small-font-size);
  }

  .datepicker-size-medium {
    --nuraly-datepicker-local-day-size: var(--nuraly-datepicker-local-medium-day-size);
    --nuraly-datepicker-local-font-size: var(--nuraly-datepicker-local-medium-font-size);
  }

  .datepicker-size-large {
    --nuraly-datepicker-local-day-size: var(--nuraly-datepicker-local-large-day-size);
    --nuraly-datepicker-local-font-size: var(--nuraly-datepicker-local-large-font-size);
  }

  /* Calendar container */
  .calendar-container {
    position: fixed;
    z-index: var(--nuraly-datepicker-calendar-z-index, var(--nuraly-datepicker-local-calendar-z-index));
    user-select: none;
    padding: var(--nuraly-datepicker-calendar-padding, var(--nuraly-datepicker-local-calendar-padding));
    width: var(--nuraly-datepicker-calendar-width, var(--nuraly-datepicker-local-calendar-width));
    height: var(--nuraly-datepicker-calendar-height, var(--nuraly-datepicker-local-calendar-height));
    background-color: var(--nuraly-datepicker-background-color, var(--nuraly-datepicker-local-background-color));
    border: var(--nuraly-datepicker-border-width, var(--nuraly-datepicker-local-border-width)) solid var(--nuraly-datepicker-border-color, var(--nuraly-datepicker-local-border-color));
    border-radius: var(--nuraly-datepicker-border-radius, var(--nuraly-datepicker-local-border-radius));
    box-shadow: var(--nuraly-datepicker-box-shadow, var(--nuraly-datepicker-local-box-shadow));
    animation: calendar-slide-in var(--nuraly-datepicker-calendar-animation-duration, var(--nuraly-datepicker-local-calendar-animation-duration)) var(--nuraly-datepicker-transition-timing, var(--nuraly-datepicker-local-transition-timing));
  }

  .calendar-range {
    width: calc(var(--nuraly-datepicker-calendar-width, var(--nuraly-datepicker-local-calendar-width)) * 2);
  }

  /* Calendar header */
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-datepicker-header-padding, var(--nuraly-datepicker-local-header-padding));
    height: var(--nuraly-datepicker-header-height, var(--nuraly-datepicker-local-header-height));
    border-bottom: var(--nuraly-datepicker-border-width, var(--nuraly-datepicker-local-border-width)) solid var(--nuraly-datepicker-border-color, var(--nuraly-datepicker-local-border-color));
    background: var(--nuraly-datepicker-header-background, var(--nuraly-datepicker-local-header-background));
  }

  .year-month-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: center;
  }

  .current-year-container {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--nuraly-datepicker-gap, var(--nuraly-datepicker-local-gap)) / 2);
  }

  .year-icons-toggler {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* Calendar content */
  .calendar-content {
    padding: var(--nuraly-datepicker-gap, var(--nuraly-datepicker-local-gap));
    padding-bottom: calc(var(--nuraly-datepicker-gap, var(--nuraly-datepicker-local-gap)) / 2);
  }

  /* Button customizations */
  hy-button {
    --nuraly-button-border-color: transparent;
    --nuraly-button-background-color: transparent;
    --nuraly-button-text-color: var(--nuraly-datepicker-text-color, var(--nuraly-datepicker-local-text-color));
    --nuraly-button-hover-background-color: var(--nuraly-datepicker-hover-color, var(--nuraly-datepicker-local-hover-color));
    --nuraly-button-transition-duration: var(--nuraly-datepicker-transition-duration, var(--nuraly-datepicker-local-transition-duration));
  }

  .toggle-year-view,
  .toggle-month-view {
    --nuraly-button-font-weight: var(--nuraly-datepicker-header-font-weight, var(--nuraly-datepicker-local-header-font-weight));
    --nuraly-button-font-size: var(--nuraly-datepicker-header-font-size, var(--nuraly-datepicker-local-header-font-size));
    --nuraly-button-padding: 4px 20px 4px 8px;
    --nuraly-button-border-radius: 6px;
    --nuraly-button-border: 1px solid var(--nuraly-datepicker-border-color, var(--nuraly-datepicker-local-border-color));
    --nuraly-button-background-color: #ffffff;
    --nuraly-button-hover-border-color: var(--nuraly-datepicker-primary-color, var(--nuraly-datepicker-local-primary-color));
    --nuraly-button-hover-background-color: #ffffff;
    --nuraly-button-active-background-color: var(--nuraly-datepicker-hover-background, var(--nuraly-datepicker-local-hover-background));
    --nuraly-button-transition: all 0.2s;
    position: relative;
    min-width: 80px;
  }

  .toggle-month-view::after,
  .toggle-year-view::after {
    content: '';
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-top: 3px solid rgba(0, 0, 0, 0.45);
    transition: all 0.2s;
  }

  .toggle-month-view:hover::after,
  .toggle-year-view:hover::after {
    border-top-color: var(--nuraly-datepicker-primary-color, var(--nuraly-datepicker-local-primary-color));
  }

  .next-year,
  .previous-year {
    --nuraly-button-width: 16px;
    --nuraly-button-height: 12px;
    --nuraly-button-padding: 0;
    --nuraly-button-min-width: auto;
    --nuraly-button-border-radius: 2px;
    --nuraly-button-text-color: rgba(0, 0, 0, 0.45);
    --nuraly-button-hover-text-color: rgba(0, 0, 0, 0.85);
    --nuraly-button-hover-background-color: rgba(0, 0, 0, 0.06);
  }

  .header-prev-button,
  .header-next-button {
    --nuraly-button-width: 24px;
    --nuraly-button-height: 24px;
    --nuraly-button-padding: 0;
    --nuraly-button-min-width: auto;
    --nuraly-button-border-radius: 2px;
    --nuraly-button-text-color: rgba(0, 0, 0, 0.45);
    --nuraly-button-hover-text-color: rgba(0, 0, 0, 0.85);
    --nuraly-button-hover-background-color: rgba(0, 0, 0, 0.06);
    --nuraly-button-transition: all 0.2s;
  }

  .header-prev-button:hover,
  .header-next-button:hover {
    --nuraly-button-background-color: rgba(0, 0, 0, 0.06);
  }

  /* Placement variants */
  .placement-top {
    animation: calendar-slide-down var(--nuraly-datepicker-calendar-animation-duration, var(--nuraly-datepicker-local-calendar-animation-duration)) var(--nuraly-datepicker-transition-timing, var(--nuraly-datepicker-local-transition-timing));
  }

  .placement-bottom {
    animation: calendar-slide-up var(--nuraly-datepicker-calendar-animation-duration, var(--nuraly-datepicker-local-calendar-animation-duration)) var(--nuraly-datepicker-transition-timing, var(--nuraly-datepicker-local-transition-timing));
  }

  /* Animations */
  @keyframes calendar-slide-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes calendar-slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes calendar-slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Legacy compatibility styles */
  .calendar-container-range {
    width: 600px;
  }

  /* Accessibility improvements */
  .calendar-container:focus-within {
    outline: var(--nuraly-datepicker-focus-border-width, var(--nuraly-datepicker-local-focus-border-width)) solid var(--nuraly-datepicker-primary-color, var(--nuraly-datepicker-local-primary-color));
    outline-offset: 2px;
  }

  /* Focus management */
  [tabindex="-1"]:focus {
    outline: none;
  }

  /* Days grid layout */
  .days-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .weekdays-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    margin-bottom: var(--nuraly-datepicker-gap, var(--nuraly-datepicker-local-gap));
  }

  .weekday-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--nuraly-datepicker-weekday-color, var(--nuraly-datepicker-local-weekday-color));
    text-align: center;
  }

  .days-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  /* Day cell base styles */
  .day-cell {
    width: var(--nuraly-datepicker-day-size, var(--nuraly-datepicker-local-day-size));
    height: var(--nuraly-datepicker-day-size, var(--nuraly-datepicker-local-day-size));
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--nuraly-datepicker-transition-duration, var(--nuraly-datepicker-local-transition-duration)) var(--nuraly-datepicker-transition-timing, var(--nuraly-datepicker-local-transition-timing));
    font-size: var(--nuraly-datepicker-day-font-size, var(--nuraly-datepicker-local-day-font-size));
    font-weight: 400;
    color: var(--nuraly-datepicker-text-color, var(--nuraly-datepicker-local-text-color));
    margin: 1px;
    position: relative;
  }

  .day-cell:hover:not(.disabled):not(.selected) {
    background-color: var(--nuraly-datepicker-hover-color, var(--nuraly-datepicker-local-hover-color));
    scale: 1.05;
  }

  .day-cell.selected {
    background-color: var(--nuraly-datepicker-selected-color, var(--nuraly-datepicker-local-selected-color)) !important;
    color: var(--nuraly-datepicker-selected-text-color, var(--nuraly-datepicker-local-selected-text-color)) !important;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .day-cell.today {
    border: 2px solid var(--nuraly-datepicker-today-color, var(--nuraly-datepicker-local-today-color));
    font-weight: 600;
  }

  .day-cell.today.selected {
    border-color: var(--nuraly-datepicker-selected-text-color, var(--nuraly-datepicker-local-selected-text-color));
  }

  .day-cell.disabled {
    background-color: var(--nuraly-datepicker-disabled-color, var(--nuraly-datepicker-local-disabled-color));
    color: var(--nuraly-datepicker-disabled-text-color, var(--nuraly-datepicker-local-disabled-text-color));
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.4;
  }

  .day-cell.in-range {
    background-color: var(--nuraly-datepicker-range-color, var(--nuraly-datepicker-local-range-color));
    border-radius: 0;
  }

  .day-cell.in-range:first-of-type {
    border-radius: 6px 0 0 6px;
  }

  .day-cell.in-range:last-of-type {
    border-radius: 0 6px 6px 0;
  }

  .day-cell.in-range.selected {
    border-radius: 6px;
  }

  /* Error states */
  :host([state="error"]) .datepicker-container {
    --nuraly-datepicker-local-input-border-color: var(--nuraly-datepicker-error-color, var(--nuraly-datepicker-local-error-color));
  }

  :host([state="warning"]) .datepicker-container {
    --nuraly-datepicker-local-input-border-color: var(--nuraly-datepicker-warning-color, var(--nuraly-datepicker-local-warning-color));
  }

  :host([state="success"]) .datepicker-container {
    --nuraly-datepicker-local-input-border-color: var(--nuraly-datepicker-success-color, var(--nuraly-datepicker-local-success-color));
  }

  /* Month/Year Dropdown Styles */
  .month-dropdown,
  .year-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    width: 120px;
    z-index: 1001;
    background: var(--nuraly-datepicker-background-color, var(--nuraly-datepicker-local-background-color));
    border: var(--nuraly-datepicker-border-width, var(--nuraly-datepicker-local-border-width)) solid var(--nuraly-datepicker-border-color, var(--nuraly-datepicker-local-border-color));
    border-radius: 6px;
    box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    max-height: 200px;
    overflow-y: auto;
    animation: dropdown-slide-in 0.15s ease-out;
  }

  .year-dropdown {
    width: 80px;
  }

  .dropdown-content {
    padding: 4px 0;
  }

  .dropdown-item {
    padding: 8px 12px;
    cursor: pointer;
    color: var(--nuraly-datepicker-text-color, var(--nuraly-datepicker-local-text-color));
    font-size: var(--nuraly-datepicker-font-size, var(--nuraly-datepicker-local-font-size));
    transition: all 0.2s;
    border-radius: 0;
  }

  .dropdown-item:hover {
    background-color: var(--nuraly-datepicker-hover-background, var(--nuraly-datepicker-local-hover-background));
  }

  .dropdown-item.selected {
    background-color: var(--nuraly-datepicker-primary-color, var(--nuraly-datepicker-local-primary-color));
    color: #ffffff;
    font-weight: 600;
  }

  .dropdown-item.selected:hover {
    background-color: var(--nuraly-datepicker-primary-color, var(--nuraly-datepicker-local-primary-color));
    opacity: 0.9;
  }

  /* Dropdown animation */
  @keyframes dropdown-slide-in {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Year/Month button container positioning */
  .current-year-container,
  .month-selector {
    position: relative;
    z-index: 1000;
  }

  .toggle-month-view,
  .toggle-year-view {
    position: relative;
    z-index: 1001;
  }

  /* Select component styling - Override the default 300px width */
  .month-select {
    --nuraly-select-width: 110px !important;
    --nuraly-select-local-width: 110px !important;
    width: 110px !important;
    max-width: 110px !important;
  }

  .year-select {
    --nuraly-select-width: 80px !important;
    --nuraly-select-local-width: 80px !important;  
    width: 80px !important;
    max-width: 80px !important;
  }
`;
