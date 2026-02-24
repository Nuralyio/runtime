import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* ========================================
     * TIMEPICKER THEME-AWARE VARIABLES
     * Uses CSS custom properties from theme files
     * ======================================== */

    /* Base timepicker styling - uses theme variables with fallbacks */
    --nuraly-timepicker-local-background-color: var(--nuraly-color-timepicker-background, #ffffff);
    --nuraly-timepicker-local-text-color: var(--nuraly-color-timepicker-text, rgba(0, 0, 0, 0.88));
    --nuraly-timepicker-local-font-family: var(--nuraly-font-family-timepicker, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif);
    --nuraly-timepicker-local-font-size: var(--nuraly-font-size-timepicker, 14px);
    
    /* Timepicker borders - theme-aware */
    --nuraly-timepicker-local-border-color: var(--nuraly-color-timepicker-border, #d9d9d9);
    --nuraly-timepicker-local-border-width: var(--nuraly-border-width-timepicker, 1px);
    --nuraly-timepicker-local-border-radius: var(--nuraly-border-radius-timepicker, 6px);
    --nuraly-timepicker-local-border-radius-sm: var(--nuraly-border-radius-timepicker-sm, calc(var(--nuraly-border-radius-timepicker, 6px) * 0.5));
    
    /* Primary and selection colors - theme-aware */
    --nuraly-timepicker-local-primary-color: var(--nuraly-color-timepicker-primary, #1890ff);
    --nuraly-timepicker-local-focus-color: var(--nuraly-color-timepicker-focus, #1890ff);
    --nuraly-timepicker-local-border-color-hover: var(--nuraly-color-timepicker-border-hover, #1890ff);
    --nuraly-timepicker-local-selected-color: var(--nuraly-color-timepicker-selected, #1890ff);
    --nuraly-timepicker-local-selected-text-color: var(--nuraly-color-timepicker-selected-text, #ffffff);
    --nuraly-timepicker-local-hover-color: var(--nuraly-color-timepicker-hover, #f5f5f5);
    --nuraly-timepicker-local-clock-hand-color: var(--nuraly-color-timepicker-clock-hand, #1890ff);
    
    /* Control item states - theme-aware */
    --nuraly-timepicker-local-control-item-bg-hover: var(--nuraly-color-timepicker-control-item-bg-hover, #f5f5f5);
    --nuraly-timepicker-local-control-item-bg-active: var(--nuraly-color-timepicker-control-item-bg-active, #e6f7ff);
    
    /* Text colors - theme-aware */
    --nuraly-timepicker-local-text-color-secondary: var(--nuraly-color-timepicker-text-secondary, rgba(0, 0, 0, 0.45));
    --nuraly-timepicker-local-text-color-disabled: var(--nuraly-color-timepicker-text-disabled, rgba(0, 0, 0, 0.25));
    
    /* Disabled states - theme-aware */
    --nuraly-timepicker-local-disabled-color: var(--nuraly-color-timepicker-disabled, #f5f5f5);
    --nuraly-timepicker-local-disabled-bg: var(--nuraly-color-timepicker-disabled-bg, #f5f5f5);
    --nuraly-timepicker-local-disabled-text-color: var(--nuraly-color-timepicker-disabled-text, rgba(0, 0, 0, 0.25));
    --nuraly-timepicker-local-disabled-opacity: var(--nuraly-opacity-timepicker-disabled, 1);
    
    /* Input field colors - theme-aware */
    --nuraly-timepicker-local-input-background: var(--nuraly-color-timepicker-input-background, #ffffff);
    --nuraly-timepicker-local-input-border-color: var(--nuraly-color-timepicker-input-border, #d9d9d9);
    --nuraly-timepicker-local-input-focus-border-color: var(--nuraly-color-timepicker-input-focus-border, #1890ff);
    --nuraly-timepicker-local-input-text-color: var(--nuraly-color-timepicker-input-text, rgba(0, 0, 0, 0.88));
    --nuraly-timepicker-local-input-placeholder-color: var(--nuraly-color-timepicker-input-placeholder, rgba(0, 0, 0, 0.25));
    
    /* Dropdown and clock colors - theme-aware */
    --nuraly-timepicker-local-dropdown-background: var(--nuraly-color-timepicker-dropdown-background, #ffffff);
    --nuraly-timepicker-local-clock-background: var(--nuraly-color-timepicker-clock-background, #ffffff);
    --nuraly-timepicker-local-clock-text-color: var(--nuraly-color-timepicker-clock-text, rgba(0, 0, 0, 0.88));
    --nuraly-timepicker-local-clock-face-color: var(--nuraly-color-timepicker-clock-face, rgba(0, 0, 0, 0.45));
    --nuraly-timepicker-local-clock-border-color: var(--nuraly-color-timepicker-clock-border, #f0f0f0);
    
    /* Item selection colors - theme-aware */
    --nuraly-timepicker-local-item-hover-color: var(--nuraly-color-timepicker-item-hover, #f5f5f5);
    --nuraly-timepicker-local-item-active-color: var(--nuraly-color-timepicker-item-active, #e6f7ff);
    --nuraly-timepicker-local-item-selected-color: var(--nuraly-color-timepicker-item-selected, #1890ff);
    --nuraly-timepicker-local-item-selected-text-color: var(--nuraly-color-timepicker-item-selected-text, #ffffff);
    
    /* Error/warning/success colors - theme-aware */
    --nuraly-timepicker-local-error-color: var(--nuraly-color-timepicker-error, #ff4d4f);
    --nuraly-timepicker-local-warning-color: var(--nuraly-color-timepicker-warning, #faad14);
    --nuraly-timepicker-local-success-color: var(--nuraly-color-timepicker-success, #52c41a);
    
    /* Layout and sizing - theme-aware */
    --nuraly-timepicker-local-width: var(--nuraly-size-timepicker-width, 120px);
    --nuraly-timepicker-local-height: var(--nuraly-size-timepicker-height, 32px);
    --nuraly-timepicker-local-dropdown-width: var(--nuraly-size-timepicker-dropdown-width, 180px);
    --nuraly-timepicker-local-clock-size: var(--nuraly-size-timepicker-clock, 200px);
    
    /* Typography - theme-aware */
    --nuraly-timepicker-local-font-weight: var(--nuraly-font-weight-timepicker, 400);
    --nuraly-timepicker-local-line-height: var(--nuraly-line-height-timepicker, 1.5715);
    --nuraly-timepicker-local-clock-font-size: var(--nuraly-font-size-timepicker-clock, 14px);
    
    /* Spacing - theme-aware */
    --nuraly-timepicker-local-gap: var(--nuraly-spacing-timepicker-gap, 4px);
    --nuraly-timepicker-local-dropdown-padding: var(--nuraly-spacing-timepicker-dropdown-padding, 8px);
    --nuraly-timepicker-local-input-padding: var(--nuraly-spacing-timepicker-input-padding, 4px 11px);
    --nuraly-timepicker-local-padding: var(--nuraly-spacing-timepicker-padding, 4px 11px);
    
    /* Borders - theme-aware */
    --nuraly-timepicker-local-input-border-width: var(--nuraly-border-width-timepicker-input, 1px);
    --nuraly-timepicker-local-focus-border-width: var(--nuraly-border-width-timepicker-focus, 2px);
    
    /* Shadows - theme-aware */
    --nuraly-timepicker-local-shadow-color: var(--nuraly-color-timepicker-shadow, rgba(0, 0, 0, 0.15));
    --nuraly-timepicker-local-box-shadow: var(--nuraly-shadow-timepicker-box, 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05));
    --nuraly-timepicker-local-input-focus-shadow: var(--nuraly-shadow-timepicker-input-focus, 0 0 0 2px rgba(24, 144, 255, 0.2));
    
    /* States - theme-aware */
    --nuraly-timepicker-local-hover-opacity: var(--nuraly-opacity-timepicker-hover, 1);
    
    /* Animation and transitions - theme-aware */
    --nuraly-timepicker-local-transition-duration: var(--nuraly-transition-duration-timepicker, 0.2s);
    --nuraly-timepicker-local-transition-timing: var(--nuraly-transition-timing-timepicker, ease-in-out);
    
    /* Z-index - theme-aware */
    --nuraly-timepicker-local-dropdown-z-index: var(--nuraly-z-index-timepicker-dropdown, 1050);
    
    /* Icon sizes - theme-aware */
    --nuraly-timepicker-local-icon-size: var(--nuraly-size-timepicker-icon, 14px);
    
    /* Size variants - theme-aware */
    --nuraly-timepicker-local-small-font-size: var(--nuraly-font-size-timepicker-small, 12px);
    --nuraly-timepicker-local-small-padding: var(--nuraly-spacing-timepicker-small-padding, 0px 7px);
    --nuraly-timepicker-local-small-height: var(--nuraly-size-timepicker-small-height, 24px);
    
    --nuraly-timepicker-local-medium-font-size: var(--nuraly-font-size-timepicker-medium, 14px);
    --nuraly-timepicker-local-medium-padding: var(--nuraly-spacing-timepicker-medium-padding, 4px 11px);
    --nuraly-timepicker-local-medium-height: var(--nuraly-size-timepicker-medium-height, 32px);
    
    --nuraly-timepicker-local-large-font-size: var(--nuraly-font-size-timepicker-large, 16px);
    --nuraly-timepicker-local-large-padding: var(--nuraly-spacing-timepicker-large-padding, 6px 11px);
    --nuraly-timepicker-local-large-height: var(--nuraly-size-timepicker-large-height, 40px);
  }
`;