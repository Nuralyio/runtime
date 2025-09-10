/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';
import { datepickerVariables } from './datepicker.style.variables.js';

export const styles = css`
  ${datepickerVariables}

  :host {
    width: fit-content;
    display: block;
    font-family: var(--hybrid-datepicker-font-family, var(--hybrid-datepicker-local-font-family));
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--hybrid-datepicker-disabled-opacity, var(--hybrid-datepicker-local-disabled-opacity));
    pointer-events: none;
  }

  :host([range]) {
    --hybrid-datepicker-local-calendar-width: 600px;
  }

  /* Theme-specific styles */
  :host([theme='dark']) {
    --hybrid-datepicker-local-background-color: #1f1f1f;
    --hybrid-datepicker-local-border-color: #424242;
    --hybrid-datepicker-local-text-color: #ffffff;
    --hybrid-datepicker-local-hover-color: #333333;
    --hybrid-datepicker-local-input-background: #1f1f1f;
    --hybrid-datepicker-local-input-border-color: #424242;
    --hybrid-datepicker-local-input-text-color: #ffffff;
  }

  /* Container styles */
  .datepicker-container {
    position: relative;
    display: block;
    width: var(--hybrid-datepicker-width, var(--hybrid-datepicker-local-width));
    font-family: var(--hybrid-datepicker-font-family, var(--hybrid-datepicker-local-font-family));
    /* Allow calendar to overflow container without causing scroll */
    overflow: visible;
  }

  .datepicker-disabled {
    opacity: var(--hybrid-datepicker-disabled-opacity, var(--hybrid-datepicker-local-disabled-opacity));
    pointer-events: none;
  }

  /* Size variants */
  .datepicker-size-small {
    --hybrid-datepicker-local-day-size: var(--hybrid-datepicker-local-small-day-size);
    --hybrid-datepicker-local-font-size: var(--hybrid-datepicker-local-small-font-size);
  }

  .datepicker-size-medium {
    --hybrid-datepicker-local-day-size: var(--hybrid-datepicker-local-medium-day-size);
    --hybrid-datepicker-local-font-size: var(--hybrid-datepicker-local-medium-font-size);
  }

  .datepicker-size-large {
    --hybrid-datepicker-local-day-size: var(--hybrid-datepicker-local-large-day-size);
    --hybrid-datepicker-local-font-size: var(--hybrid-datepicker-local-large-font-size);
  }

  /* Calendar container */
  .calendar-container {
    position: fixed;
    z-index: var(--hybrid-datepicker-calendar-z-index, var(--hybrid-datepicker-local-calendar-z-index));
    user-select: none;
    padding: var(--hybrid-datepicker-calendar-padding, var(--hybrid-datepicker-local-calendar-padding));
    width: var(--hybrid-datepicker-calendar-width, var(--hybrid-datepicker-local-calendar-width));
    height: var(--hybrid-datepicker-calendar-height, var(--hybrid-datepicker-local-calendar-height));
    background-color: var(--hybrid-datepicker-background-color, var(--hybrid-datepicker-local-background-color));
    border: var(--hybrid-datepicker-border-width, var(--hybrid-datepicker-local-border-width)) solid var(--hybrid-datepicker-border-color, var(--hybrid-datepicker-local-border-color));
    border-radius: var(--hybrid-datepicker-border-radius, var(--hybrid-datepicker-local-border-radius));
    box-shadow: var(--hybrid-datepicker-box-shadow, var(--hybrid-datepicker-local-box-shadow));
    animation: calendar-slide-in var(--hybrid-datepicker-calendar-animation-duration, var(--hybrid-datepicker-local-calendar-animation-duration)) var(--hybrid-datepicker-transition-timing, var(--hybrid-datepicker-local-transition-timing));
  }

  .calendar-range {
    width: calc(var(--hybrid-datepicker-calendar-width, var(--hybrid-datepicker-local-calendar-width)) * 2);
  }

  /* Calendar header */
  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--hybrid-datepicker-header-padding, var(--hybrid-datepicker-local-header-padding));
    height: var(--hybrid-datepicker-header-height, var(--hybrid-datepicker-local-header-height));
    border-bottom: var(--hybrid-datepicker-border-width, var(--hybrid-datepicker-local-border-width)) solid var(--hybrid-datepicker-border-color, var(--hybrid-datepicker-local-border-color));
    background: var(--hybrid-datepicker-header-background, var(--hybrid-datepicker-local-header-background));
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
    gap: calc(var(--hybrid-datepicker-gap, var(--hybrid-datepicker-local-gap)) / 2);
  }

  .year-icons-toggler {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  /* Calendar content */
  .calendar-content {
    padding: var(--hybrid-datepicker-gap, var(--hybrid-datepicker-local-gap));
    padding-bottom: calc(var(--hybrid-datepicker-gap, var(--hybrid-datepicker-local-gap)) / 2);
  }

  /* Button customizations */
  hy-button {
    --hybrid-button-border-color: transparent;
    --hybrid-button-background-color: transparent;
    --hybrid-button-text-color: var(--hybrid-datepicker-text-color, var(--hybrid-datepicker-local-text-color));
    --hybrid-button-hover-background-color: var(--hybrid-datepicker-hover-color, var(--hybrid-datepicker-local-hover-color));
    --hybrid-button-transition-duration: var(--hybrid-datepicker-transition-duration, var(--hybrid-datepicker-local-transition-duration));
  }

  .toggle-year-view,
  .toggle-month-view {
    --hybrid-button-font-weight: var(--hybrid-datepicker-header-font-weight, var(--hybrid-datepicker-local-header-font-weight));
    --hybrid-button-font-size: var(--hybrid-datepicker-header-font-size, var(--hybrid-datepicker-local-header-font-size));
    --hybrid-button-padding: 4px 20px 4px 8px;
    --hybrid-button-border-radius: 6px;
    --hybrid-button-border: 1px solid var(--hybrid-datepicker-border-color, var(--hybrid-datepicker-local-border-color));
    --hybrid-button-background-color: #ffffff;
    --hybrid-button-hover-border-color: var(--hybrid-datepicker-primary-color, var(--hybrid-datepicker-local-primary-color));
    --hybrid-button-hover-background-color: #ffffff;
    --hybrid-button-active-background-color: var(--hybrid-datepicker-hover-background, var(--hybrid-datepicker-local-hover-background));
    --hybrid-button-transition: all 0.2s;
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
    border-top-color: var(--hybrid-datepicker-primary-color, var(--hybrid-datepicker-local-primary-color));
  }

  .next-year,
  .previous-year {
    --hybrid-button-width: 16px;
    --hybrid-button-height: 12px;
    --hybrid-button-padding: 0;
    --hybrid-button-min-width: auto;
    --hybrid-button-border-radius: 2px;
    --hybrid-button-text-color: rgba(0, 0, 0, 0.45);
    --hybrid-button-hover-text-color: rgba(0, 0, 0, 0.85);
    --hybrid-button-hover-background-color: rgba(0, 0, 0, 0.06);
  }

  .header-prev-button,
  .header-next-button {
    --hybrid-button-width: 24px;
    --hybrid-button-height: 24px;
    --hybrid-button-padding: 0;
    --hybrid-button-min-width: auto;
    --hybrid-button-border-radius: 2px;
    --hybrid-button-text-color: rgba(0, 0, 0, 0.45);
    --hybrid-button-hover-text-color: rgba(0, 0, 0, 0.85);
    --hybrid-button-hover-background-color: rgba(0, 0, 0, 0.06);
    --hybrid-button-transition: all 0.2s;
  }

  .header-prev-button:hover,
  .header-next-button:hover {
    --hybrid-button-background-color: rgba(0, 0, 0, 0.06);
  }

  /* Placement variants */
  .placement-top {
    animation: calendar-slide-down var(--hybrid-datepicker-calendar-animation-duration, var(--hybrid-datepicker-local-calendar-animation-duration)) var(--hybrid-datepicker-transition-timing, var(--hybrid-datepicker-local-transition-timing));
  }

  .placement-bottom {
    animation: calendar-slide-up var(--hybrid-datepicker-calendar-animation-duration, var(--hybrid-datepicker-local-calendar-animation-duration)) var(--hybrid-datepicker-transition-timing, var(--hybrid-datepicker-local-transition-timing));
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
    outline: var(--hybrid-datepicker-focus-border-width, var(--hybrid-datepicker-local-focus-border-width)) solid var(--hybrid-datepicker-primary-color, var(--hybrid-datepicker-local-primary-color));
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
    margin-bottom: var(--hybrid-datepicker-gap, var(--hybrid-datepicker-local-gap));
  }

  .weekday-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--hybrid-datepicker-weekday-color, var(--hybrid-datepicker-local-weekday-color));
    text-align: center;
  }

  .days-body {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
  }

  /* Day cell base styles */
  .day-cell {
    width: var(--hybrid-datepicker-day-size, var(--hybrid-datepicker-local-day-size));
    height: var(--hybrid-datepicker-day-size, var(--hybrid-datepicker-local-day-size));
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    transition: all var(--hybrid-datepicker-transition-duration, var(--hybrid-datepicker-local-transition-duration)) var(--hybrid-datepicker-transition-timing, var(--hybrid-datepicker-local-transition-timing));
    font-size: var(--hybrid-datepicker-day-font-size, var(--hybrid-datepicker-local-day-font-size));
    font-weight: 400;
    color: var(--hybrid-datepicker-text-color, var(--hybrid-datepicker-local-text-color));
    margin: 1px;
    position: relative;
  }

  .day-cell:hover:not(.disabled):not(.selected) {
    background-color: var(--hybrid-datepicker-hover-color, var(--hybrid-datepicker-local-hover-color));
    scale: 1.05;
  }

  .day-cell.selected {
    background-color: var(--hybrid-datepicker-selected-color, var(--hybrid-datepicker-local-selected-color)) !important;
    color: var(--hybrid-datepicker-selected-text-color, var(--hybrid-datepicker-local-selected-text-color)) !important;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .day-cell.today {
    border: 2px solid var(--hybrid-datepicker-today-color, var(--hybrid-datepicker-local-today-color));
    font-weight: 600;
  }

  .day-cell.today.selected {
    border-color: var(--hybrid-datepicker-selected-text-color, var(--hybrid-datepicker-local-selected-text-color));
  }

  .day-cell.disabled {
    background-color: var(--hybrid-datepicker-disabled-color, var(--hybrid-datepicker-local-disabled-color));
    color: var(--hybrid-datepicker-disabled-text-color, var(--hybrid-datepicker-local-disabled-text-color));
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.4;
  }

  .day-cell.in-range {
    background-color: var(--hybrid-datepicker-range-color, var(--hybrid-datepicker-local-range-color));
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
    --hybrid-datepicker-local-input-border-color: var(--hybrid-datepicker-error-color, var(--hybrid-datepicker-local-error-color));
  }

  :host([state="warning"]) .datepicker-container {
    --hybrid-datepicker-local-input-border-color: var(--hybrid-datepicker-warning-color, var(--hybrid-datepicker-local-warning-color));
  }

  :host([state="success"]) .datepicker-container {
    --hybrid-datepicker-local-input-border-color: var(--hybrid-datepicker-success-color, var(--hybrid-datepicker-local-success-color));
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
    background: var(--hybrid-datepicker-background-color, var(--hybrid-datepicker-local-background-color));
    border: var(--hybrid-datepicker-border-width, var(--hybrid-datepicker-local-border-width)) solid var(--hybrid-datepicker-border-color, var(--hybrid-datepicker-local-border-color));
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
    color: var(--hybrid-datepicker-text-color, var(--hybrid-datepicker-local-text-color));
    font-size: var(--hybrid-datepicker-font-size, var(--hybrid-datepicker-local-font-size));
    transition: all 0.2s;
    border-radius: 0;
  }

  .dropdown-item:hover {
    background-color: var(--hybrid-datepicker-hover-background, var(--hybrid-datepicker-local-hover-background));
  }

  .dropdown-item.selected {
    background-color: var(--hybrid-datepicker-primary-color, var(--hybrid-datepicker-local-primary-color));
    color: #ffffff;
    font-weight: 600;
  }

  .dropdown-item.selected:hover {
    background-color: var(--hybrid-datepicker-primary-color, var(--hybrid-datepicker-local-primary-color));
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
    --hybrid-select-width: 110px !important;
    --hybrid-select-local-width: 110px !important;
    width: 110px !important;
    max-width: 110px !important;
  }

  .year-select {
    --hybrid-select-width: 80px !important;
    --hybrid-select-local-width: 80px !important;  
    width: 80px !important;
    max-width: 80px !important;
  }
`;
