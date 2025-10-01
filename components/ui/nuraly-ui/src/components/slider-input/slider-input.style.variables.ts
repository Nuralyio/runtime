import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* Component dimensions */
    --nuraly-slider-input-local-width: var(--nuraly-size-slider-input-width, 100%);
    --nuraly-slider-input-local-track-height: var(--nuraly-size-slider-input-track-height, 8px);
    --nuraly-slider-input-local-thumb-diameter: var(--nuraly-size-slider-input-thumb-diameter, 20px);
    --nuraly-slider-input-local-border-width: var(--nuraly-border-slider-input-width, 1px);

    /* Size variants */
    --nuraly-slider-input-local-small-height: var(--nuraly-size-slider-input-small-height, 6px);
    --nuraly-slider-input-local-small-thumb-diameter: var(--nuraly-size-slider-input-small-thumb-diameter, 16px);
    --nuraly-slider-input-local-large-height: var(--nuraly-size-slider-input-large-height, 10px);
    --nuraly-slider-input-local-large-thumb-diameter: var(--nuraly-size-slider-input-large-thumb-diameter, 24px);

    /* Typography */
    --nuraly-slider-input-local-font-family: var(--nuraly-typograpnr-slider-input-font-family, var(--nuraly-font-family-base, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif));
    --nuraly-slider-input-local-font-size: var(--nuraly-typograpnr-slider-input-font-size, var(--nuraly-font-size-base, 14px));
    --nuraly-slider-input-local-font-weight: var(--nuraly-typograpnr-slider-input-font-weight, var(--nuraly-font-weight-normal, 400));

    /* Border radius */
    --nuraly-slider-input-local-border-radius: var(--nuraly-border-slider-input-radius, var(--nuraly-border-radius-base, 6px));
    --nuraly-slider-input-local-thumb-border-radius: var(--nuraly-border-slider-input-thumb-radius, var(--nuraly-border-radius-round, 50%));

    /* Colors - Track */
    --nuraly-slider-input-local-track-color: var(--nuraly-color-slider-input-track, var(--nuraly-color-neutral-200, #e5e7eb));
    --nuraly-slider-input-local-track-filled-color: var(--nuraly-color-slider-input-track-filled, var(--nuraly-color-primary-500, #3b82f6));
    --nuraly-slider-input-local-border-color: var(--nuraly-color-slider-input-border, var(--nuraly-color-neutral-300, #d1d5db));

    /* Colors - Thumb */
    --nuraly-slider-input-local-thumb-color: var(--nuraly-color-slider-input-thumb, var(--nuraly-color-white, #ffffff));
    --nuraly-slider-input-local-thumb-border-color: var(--nuraly-color-slider-input-thumb-border, var(--nuraly-color-primary-500, #3b82f6));
    --nuraly-slider-input-local-thumb-hover-color: var(--nuraly-color-slider-input-thumb-hover, var(--nuraly-color-primary-50, #eff6ff));
    --nuraly-slider-input-local-thumb-active-color: var(--nuraly-color-slider-input-thumb-active, var(--nuraly-color-primary-100, #dbeafe));

    /* Colors - Disabled states */
    --nuraly-slider-input-local-disabled-track-color: var(--nuraly-color-slider-input-disabled-track, var(--nuraly-color-neutral-100, #f5f5f5));
    --nuraly-slider-input-local-disabled-color: var(--nuraly-color-slider-input-disabled, var(--nuraly-color-neutral-300, #d1d5db));
    --nuraly-slider-input-local-disabled-thumb-color: var(--nuraly-color-slider-input-disabled-thumb, var(--nuraly-color-neutral-200, #e5e7eb));
    --nuraly-slider-input-local-disabled-border-color: var(--nuraly-color-slider-input-disabled-border, var(--nuraly-color-neutral-200, #e5e7eb));

    /* Colors - Status states */
    --nuraly-slider-input-local-error-color: var(--nuraly-color-slider-input-error, var(--nuraly-color-error-500, #ef4444));
    --nuraly-slider-input-local-warning-color: var(--nuraly-color-slider-input-warning, var(--nuraly-color-warning-500, #f59e0b));
    --nuraly-slider-input-local-success-color: var(--nuraly-color-slider-input-success, var(--nuraly-color-success-500, #10b981));

    /* Shadows */
    --nuraly-slider-input-local-thumb-shadow: var(--nuraly-shadow-slider-input-thumb, var(--nuraly-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05)));
    --nuraly-slider-input-local-focus-shadow: var(--nuraly-shadow-slider-input-focus, var(--nuraly-shadow-focus, 0 0 0 3px rgba(59, 130, 246, 0.15)));

    /* Elevation */
    --nuraly-slider-input-local-z-index: var(--nuraly-elevation-slider-input-z-index, var(--nuraly-z-index-base, 1));

    /* Transitions */
    --nuraly-slider-input-local-transition-duration: var(--nuraly-transition-slider-input-duration, var(--nuraly-transition-duration-base, 150ms));
    --nuraly-slider-input-local-transition-timing: var(--nuraly-transition-slider-input-timing, var(--nuraly-transition-timing-ease, ease));
  }
`;