import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* Typography */
    --nuraly-label-local-font-family: var(--nuraly-typograpnr-label-font-family, var(--nuraly-font-family-base, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif));
    --nuraly-label-local-font-weight: var(--nuraly-typograpnr-label-font-weight, var(--nuraly-font-weight-medium, 500));
    --nuraly-label-local-line-height: var(--nuraly-typograpnr-label-line-height, var(--nuraly-line-height-base, 1.5));

    /* Size variants */
    --nuraly-label-local-small-font-size: var(--nuraly-typograpnr-label-small-font-size, var(--nuraly-font-size-xs, 12px));
    --nuraly-label-local-medium-font-size: var(--nuraly-typograpnr-label-medium-font-size, var(--nuraly-font-size-sm, 14px));
    --nuraly-label-local-large-font-size: var(--nuraly-typograpnr-label-large-font-size, var(--nuraly-font-size-base, 16px));

    /* Default font size */
    --nuraly-label-local-font-size: var(--nuraly-label-local-medium-font-size);

    /* Colors */
    --nuraly-label-local-text-color: var(--nuraly-color-label-text, var(--nuraly-color-text-primary, #000000));
    --nuraly-label-local-secondary-color: var(--nuraly-color-label-secondary, var(--nuraly-color-text-secondary, #666666));
    --nuraly-label-local-error-color: var(--nuraly-color-label-error, var(--nuraly-color-error-500, #ff4d4f));
    --nuraly-label-local-warning-color: var(--nuraly-color-label-warning, var(--nuraly-color-warning-500, #faad14));
    --nuraly-label-local-success-color: var(--nuraly-color-label-success, var(--nuraly-color-success-500, #52c41a));
    --nuraly-label-local-required-color: var(--nuraly-color-label-required, var(--nuraly-color-error-500, #ff4d4f));
    --nuraly-label-local-disabled-color: var(--nuraly-color-label-disabled, var(--nuraly-color-text-disabled, #bfbfbf));

    /* Spacing */
    --nuraly-label-local-margin-bottom: var(--nuraly-spacing-label-margin-bottom, var(--nuraly-spacing-xs, 4px));
    --nuraly-label-local-required-margin: var(--nuraly-spacing-label-required-margin, var(--nuraly-spacing-2xs, 2px));

    /* Transitions */
    --nuraly-label-local-transition-duration: var(--nuraly-transition-label-duration, var(--nuraly-transition-duration-base, 150ms));
    --nuraly-label-local-transition-timing: var(--nuraly-transition-label-timing, var(--nuraly-transition-timing-ease, ease));
  }
`;