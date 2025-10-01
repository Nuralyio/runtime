import { css } from "lit";
import { styleVariables } from './slider-input.style.variables.js';

export default css`
  ${styleVariables}

  :host {
    display: inline-block;
    width: var(--nuraly-slider-input-local-width);
    font-family: var(--nuraly-slider-input-local-font-family);
    font-size: var(--nuraly-slider-input-local-font-size);
    font-weight: var(--nuraly-slider-input-local-font-weight);
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }

  .slider-wrapper {
    position: relative;
    padding: calc(var(--nuraly-slider-input-local-thumb-diameter) / 2) 0;
  }

  .range-container {
    position: relative;
    width: 100%;
  }

  .range-slider,
  .range-slider-value {
    border-radius: var(--nuraly-slider-input-local-border-radius);
    height: var(--nuraly-slider-input-local-track-height);
    position: absolute;
    top: calc((var(--nuraly-slider-input-local-thumb-diameter) - var(--nuraly-slider-input-local-track-height)) / 2);
    transition: all var(--nuraly-slider-input-local-transition-duration) var(--nuraly-slider-input-local-transition-timing);
  }

  .range-slider {
    background: var(--nuraly-slider-input-local-track-color);
    width: 100%;
    border: var(--nuraly-slider-input-local-border-width) solid var(--nuraly-slider-input-local-border-color);
  }

  .range-slider-value {
    background: var(--nuraly-slider-input-local-track-filled-color);
    width: var(--nr-slider-value-width, 0%);
    z-index: calc(var(--nuraly-slider-input-local-z-index) + 1);
  }

  .range-thumb {
    background: var(--nuraly-slider-input-local-thumb-color);
    border: 2px solid var(--nuraly-slider-input-local-thumb-border-color);
    border-radius: var(--nuraly-slider-input-local-thumb-border-radius);
    height: var(--nuraly-slider-input-local-thumb-diameter);
    width: var(--nuraly-slider-input-local-thumb-diameter);
    position: absolute;
    top: calc((var(--nuraly-slider-input-local-track-height) - var(--nuraly-slider-input-local-thumb-diameter)) / 2);
    left: var(--nr-slider-thumb-offset, 0px);
    cursor: pointer;
    z-index: calc(var(--nuraly-slider-input-local-z-index) + 2);
    box-shadow: var(--nuraly-slider-input-local-thumb-shadow);
    transition: all var(--nuraly-slider-input-local-transition-duration) var(--nuraly-slider-input-local-transition-timing);
  }

  .range-thumb:hover {
    background: var(--nuraly-slider-input-local-thumb-hover-color);
    box-shadow: var(--nuraly-slider-input-local-focus-shadow);
  }

  .range-thumb:active {
    background: var(--nuraly-slider-input-local-thumb-active-color);
    box-shadow: var(--nuraly-slider-input-local-focus-shadow);
  }

  input {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    margin: 0;
    opacity: 0;
    width: 100%;
    cursor: pointer;
    z-index: calc(var(--nuraly-slider-input-local-z-index) + 3);
    appearance: none;
    background: transparent;
    pointer-events: auto;
  }

  input::-webkit-slider-thumb {
    appearance: none;
    width: var(--nuraly-slider-input-local-thumb-diameter);
    height: var(--nuraly-slider-input-local-thumb-diameter);
    background: transparent;
    cursor: pointer;
  }

  input::-moz-range-thumb {
    appearance: none;
    width: var(--nuraly-slider-input-local-thumb-diameter);
    height: var(--nuraly-slider-input-local-thumb-diameter);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  input:focus-visible + .range-container .range-thumb {
    box-shadow: var(--nuraly-slider-input-local-focus-shadow);
  }

  /* Disabled state styling */
  :host([disabled]) .range-slider {
    background: var(--nuraly-slider-input-local-disabled-track-color);
    border-color: var(--nuraly-slider-input-local-disabled-border-color);
  }

  :host([disabled]) .range-slider-value {
    background: var(--nuraly-slider-input-local-disabled-color);
  }

  :host([disabled]) .range-thumb {
    background: var(--nuraly-slider-input-local-disabled-thumb-color);
    border-color: var(--nuraly-slider-input-local-disabled-border-color);
    cursor: not-allowed;
    box-shadow: none;
  }

  :host([disabled]) input {
    cursor: not-allowed;
  }

  /* Size variants */
  :host([size="small"]) {
    --nuraly-slider-input-local-track-height: var(--nuraly-slider-input-local-small-height);
    --nuraly-slider-input-local-thumb-diameter: var(--nuraly-slider-input-local-small-thumb-diameter);
  }

  :host([size="large"]) {
    --nuraly-slider-input-local-track-height: var(--nuraly-slider-input-local-large-height);
    --nuraly-slider-input-local-thumb-diameter: var(--nuraly-slider-input-local-large-thumb-diameter);
  }

  /* Error state */
  :host([error]) .range-slider-value {
    background: var(--nuraly-slider-input-local-error-color);
  }

  :host([error]) .range-thumb {
    border-color: var(--nuraly-slider-input-local-error-color);
  }

  /* Warning state */
  :host([warning]) .range-slider-value {
    background: var(--nuraly-slider-input-local-warning-color);
  }

  :host([warning]) .range-thumb {
    border-color: var(--nuraly-slider-input-local-warning-color);
  }

  /* Success state */
  :host([success]) .range-slider-value {
    background: var(--nuraly-slider-input-local-success-color);
  }

  :host([success]) .range-thumb {
    border-color: var(--nuraly-slider-input-local-success-color);
  }
`;