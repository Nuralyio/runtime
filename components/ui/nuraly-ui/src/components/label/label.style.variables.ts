import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* Typography */
    --nuraly-label-font-family: var(--nuraly-font-family-base, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif);
    --nuraly-label-font-weight: var(--nuraly-font-weight-medium, 300);
    --nuraly-label-line-height: var(--nuraly-line-height-base, auto);

    /* Size variants */
    --nuraly-label-small-font-size: var(--nuraly-font-size-xs, 12px);
    --nuraly-label-medium-font-size: var(--nuraly-font-size-sm, 14px);
    --nuraly-label-large-font-size: var(--nuraly-font-size-base, 16px);

    /* Default font size */
    --nuraly-label-font-size: var(--nuraly-label-medium-font-size);

    /* Colors */
    --nuraly-label-text-color: var(--nuraly-color-text-primary, #000000);
    --nuraly-label-secondary-color: var(--nuraly-color-text-secondary, #666666);
    --nuraly-label-error-color: var(--nuraly-color-error-500, #ff4d4f);
    --nuraly-label-warning-color: var(--nuraly-color-warning-500, #faad14);
    --nuraly-label-success-color: var(--nuraly-color-success-500, #52c41a);
    --nuraly-label-required-color: var(--nuraly-color-error-500, #ff4d4f);
    --nuraly-label-disabled-color: var(--nuraly-color-text-disabled, #bfbfbf);

    /* Spacing */
    --nuraly-label-margin-bottom: var(--nuraly-spacing-xs, 4px);
    --nuraly-label-required-margin: var(--nuraly-spacing-2xs, 2px);

    /* Transitions */
    --nuraly-label-transition-duration: var(--nuraly-transition-duration-base, 150ms);
    --nuraly-label-transition-timing: var(--nuraly-transition-timing-ease, ease);
  }
`;