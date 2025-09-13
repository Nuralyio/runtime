import { css } from 'lit';

/**
 * Button component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the hy-button component with
 * clean CSS variable usage without local fallbacks.
 */
export const buttonStyles = css`
  :host {
    display: inline-block;
    vertical-align: middle;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-family: var(--nuraly-font-family);
    font-size: 0.875rem;
    font-weight: var(--nuraly-font-weight-regular);
    line-height: 1.125rem;
    letter-spacing: 0.16px;
    min-width: 5rem;
    height: 3rem;
    padding: var(--nuraly-spacing-2) var(--nuraly-spacing-4);
    border: 1px solid transparent;
    border-radius: var(--nuraly-border-radius-medium);
    background-color: var(--nuraly-color-background);
    color: var(--nuraly-color-text);
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:focus {
      outline: var(--nuraly-focus-outline);
      outline-offset: var(--nuraly-focus-outline-offset);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    /* Icon styling */
    hy-icon {
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
    }

    /* Icon spacing */
    &:has(hy-icon:first-child:not(:last-child)) {
      gap: 0.5rem;
    }

    &:has(hy-icon:last-child:not(:first-child)) {
      gap: 0.5rem;
    }
  }

  /* Primary Button */
  :host([type="primary"]) button {
    background-color: var(--nuraly-color-button-primary);
    border-color: var(--nuraly-color-button-primary);
    color: var(--nuraly-color-text-on-color);

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-button-primary-hover);
      border-color: var(--nuraly-color-button-primary-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-button-primary-active);
      border-color: var(--nuraly-color-button-primary-active);
    }
  }

  /* Secondary Button */
  :host([type="secondary"]) button {
    background-color: var(--nuraly-color-button-secondary);
    border-color: var(--nuraly-color-button-secondary);
    color: var(--nuraly-color-text-on-color);

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-button-secondary-hover);
      border-color: var(--nuraly-color-button-secondary-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-button-secondary-active);
      border-color: var(--nuraly-color-button-secondary-active);
    }
  }

  /* Tertiary/Ghost Button */
  :host([type="tertiary"]), :host([type="ghost"]) button {
    background-color: transparent;
    border-color: var(--nuraly-color-border);
    color: var(--nuraly-color-button-primary);

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-background-hover);
      border-color: var(--nuraly-color-button-primary);
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-background-active);
    }
  }

  /* Danger Button */
  :host([type="danger"]) button {
    background-color: var(--nuraly-color-danger);
    border-color: var(--nuraly-color-danger);
    color: var(--nuraly-color-text-on-color);

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-danger-hover);
      border-color: var(--nuraly-color-danger-hover);
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-danger-active);
      border-color: var(--nuraly-color-danger-active);
    }
  }

  /* Size variants */
  :host([size="sm"]), :host([size="small"]) button {
    height: var(--nuraly-size-sm);
    padding: var(--nuraly-spacing-01) var(--nuraly-spacing-03);
    font-size: 0.75rem;
    min-width: 4rem;
  }

  :host([size="md"]), :host([size="medium"]) button {
    height: var(--nuraly-size-md);
    padding: var(--nuraly-spacing-2) var(--nuraly-spacing-4);
  }

  :host([size="lg"]), :host([size="large"]) button {
    height: var(--nuraly-size-lg);
    padding: var(--nuraly-spacing-05) var(--nuraly-spacing-06);
    font-size: 1rem;
    min-width: 6rem;
  }

  :host([size="xl"]), :host([size="xlarge"]) button {
    height: var(--nuraly-size-xl);
    padding: var(--nuraly-spacing-06) var(--nuraly-spacing-07);
    font-size: 1.125rem;
    min-width: 7rem;
  }

  /* Full width */
  :host([full-width]) {
    width: 100%;
  }

  :host([full-width]) button {
    width: 100%;
  }

  /* Loading state */
  :host([loading]) button {
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Shape variants */
  :host([shape="round"]) button {
    border-radius: 50%;
    min-width: auto;
    width: var(--nuraly-size-md);
    aspect-ratio: 1;
    padding: 0;
  }

  :host([shape="round"][size="sm"]) button,
  :host([shape="round"][size="small"]) button {
    width: var(--nuraly-size-sm);
  }

  :host([shape="round"][size="lg"]) button,
  :host([shape="round"][size="large"]) button {
    width: var(--nuraly-size-lg);
  }

  :host([shape="round"][size="xl"]) button,
  :host([shape="round"][size="xlarge"]) button {
    width: var(--nuraly-size-xl);
  }

  /* Enhanced Ripple Effect Animation */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
    z-index: 1;
  }

  @keyframes ripple-animation {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    70% {
      transform: scale(3);
      opacity: 0.5;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Ripple effect for different button types */
  :host([type="primary"]) .ripple {
    background: rgba(255, 255, 255, 0.4);
  }

  :host([type="secondary"]) .ripple {
    background: rgba(255, 255, 255, 0.3);
  }

  :host([type="ghost"]) .ripple,
  :host([type="tertiary"]) .ripple {
    background: rgba(15, 98, 254, 0.2);
  }

  :host([type="danger"]) .ripple {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const styles = buttonStyles;
