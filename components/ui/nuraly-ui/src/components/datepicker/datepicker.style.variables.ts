import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* ========================================
     * DATEPICKER THEME-AWARE VARIABLES
     * Uses CSS custom properties from theme files
     * ======================================== */

    /* Base datepicker styling - uses theme variables with fallbacks */
    --nuraly-datepicker-local-background-color: var(--nuraly-color-datepicker-background, #ffffff);
    --nuraly-datepicker-local-text-color: var(--nuraly-color-datepicker-text, #000000);
    --nuraly-datepicker-local-font-family: var(--nuraly-font-family-datepicker, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
    --nuraly-datepicker-local-font-size: var(--nuraly-font-size-datepicker, 14px);
    
    /* Datepicker borders - theme-aware */
    --nuraly-datepicker-local-border-color: var(--nuraly-color-datepicker-border, #d9d9d9);
    --nuraly-datepicker-local-border-width: var(--nuraly-border-width-datepicker, 1px);
    --nuraly-datepicker-local-border-radius: var(--nuraly-border-radius-datepicker, 8px);
    
    /* Primary and selection colors - theme-aware */
    --nuraly-datepicker-local-primary-color: var(--nuraly-color-datepicker-primary, #1677ff);
    --nuraly-datepicker-local-selected-color: var(--nuraly-color-datepicker-selected, #1677ff);
    --nuraly-datepicker-local-selected-text-color: var(--nuraly-color-datepicker-selected-text, #ffffff);
    --nuraly-datepicker-local-hover-color: var(--nuraly-color-datepicker-hover, #f5f5f5);
    --nuraly-datepicker-local-today-color: var(--nuraly-color-datepicker-today, #1677ff);
    
    /* Disabled states - theme-aware */
    --nuraly-datepicker-local-disabled-color: var(--nuraly-color-datepicker-disabled, #f5f5f5);
    --nuraly-datepicker-local-disabled-text-color: var(--nuraly-color-datepicker-disabled-text, #bfbfbf);
    --nuraly-datepicker-local-disabled-opacity: var(--nuraly-opacity-datepicker-disabled, 0.5);
    
    /* Input field colors - theme-aware */
    --nuraly-datepicker-local-input-background: var(--nuraly-color-datepicker-input-background, #ffffff);
    --nuraly-datepicker-local-input-border-color: var(--nuraly-color-datepicker-input-border, #d9d9d9);
    --nuraly-datepicker-local-input-focus-border-color: var(--nuraly-color-datepicker-input-focus-border, #1677ff);
    --nuraly-datepicker-local-input-text-color: var(--nuraly-color-datepicker-input-text, #000000);
    --nuraly-datepicker-local-input-placeholder-color: var(--nuraly-color-datepicker-input-placeholder, #bfbfbf);
    
    /* Special date colors - theme-aware */
    --nuraly-datepicker-local-weekend-color: var(--nuraly-color-datepicker-weekend, #ff4d4f);
    --nuraly-datepicker-local-weekday-color: var(--nuraly-color-datepicker-weekday, #8c8c8c);
    --nuraly-datepicker-local-range-color: var(--nuraly-color-datepicker-range, rgba(22, 119, 255, 0.1));
    --nuraly-datepicker-local-error-color: var(--nuraly-color-datepicker-error, #da1e28);
    --nuraly-datepicker-local-warning-color: var(--nuraly-color-datepicker-warning, #f0c300);
    --nuraly-datepicker-local-success-color: var(--nuraly-color-datepicker-success, #24a148);
    
    /* Header specific colors - theme-aware */
    --nuraly-datepicker-local-header-background: var(--nuraly-color-datepicker-header-background, #ffffff);
    --nuraly-datepicker-local-hover-background: var(--nuraly-color-datepicker-hover-background, rgba(0, 0, 0, 0.04));
    --nuraly-datepicker-local-active-background: var(--nuraly-color-datepicker-active-background, rgba(0, 0, 0, 0.06));
    
    /* Layout and sizing - theme-aware */
    --nuraly-datepicker-local-width: var(--nuraly-size-datepicker-width, 280px);
    --nuraly-datepicker-local-height: var(--nuraly-size-datepicker-height, auto);
    --nuraly-datepicker-local-calendar-width: var(--nuraly-size-datepicker-calendar-width, 320px);
    --nuraly-datepicker-local-calendar-height: var(--nuraly-size-datepicker-calendar-height, auto);
    --nuraly-datepicker-local-day-size: var(--nuraly-size-datepicker-day, 36px);
    --nuraly-datepicker-local-header-height: var(--nuraly-size-datepicker-header-height, 56px);
    
    /* Typography - theme-aware */
    --nuraly-datepicker-local-font-weight: var(--nuraly-font-weight-datepicker, 400);
    --nuraly-datepicker-local-header-font-size: var(--nuraly-font-size-datepicker-header, 16px);
    --nuraly-datepicker-local-header-font-weight: var(--nuraly-font-weight-datepicker-header, 600);
    --nuraly-datepicker-local-day-font-size: var(--nuraly-font-size-datepicker-day, 14px);
    --nuraly-datepicker-local-input-font-size: var(--nuraly-font-size-datepicker-input, 14px);
    --nuraly-datepicker-local-label-font-size: var(--nuraly-font-size-datepicker-label, 14px);
    --nuraly-datepicker-local-helper-font-size: var(--nuraly-font-size-datepicker-helper, 12px);
    --nuraly-datepicker-local-message-font-size: var(--nuraly-font-size-datepicker-message, 12px);
    
    /* Spacing - theme-aware */
    --nuraly-datepicker-local-gap: var(--nuraly-spacing-datepicker-gap, 6px);
    --nuraly-datepicker-local-calendar-padding: var(--nuraly-spacing-datepicker-calendar-padding, 12px);
    --nuraly-datepicker-local-day-padding: var(--nuraly-spacing-datepicker-day-padding, 6px);
    --nuraly-datepicker-local-input-padding: var(--nuraly-spacing-datepicker-input-padding, 8px 12px);
    --nuraly-datepicker-local-padding: var(--nuraly-spacing-datepicker-padding, 16px);
    --nuraly-datepicker-local-margin: var(--nuraly-spacing-datepicker-margin, 0);
    
    /* Borders - theme-aware */
    --nuraly-datepicker-local-input-border-width: var(--nuraly-border-width-datepicker-input, 1px);
    --nuraly-datepicker-local-focus-border-width: var(--nuraly-border-width-datepicker-focus, 2px);
    
    /* Shadows - theme-aware */
    --nuraly-datepicker-local-shadow-color: var(--nuraly-color-datepicker-shadow, rgba(0, 0, 0, 0.1));
    --nuraly-datepicker-local-box-shadow: var(--nuraly-shadow-datepicker-box, 0 6px 16px 0 var(--nuraly-datepicker-local-shadow-color));
    --nuraly-datepicker-local-input-focus-shadow: var(--nuraly-shadow-datepicker-input-focus, 0 0 0 2px rgba(22, 119, 255, 0.2));
    
    /* States - theme-aware */
    --nuraly-datepicker-local-hover-opacity: var(--nuraly-opacity-datepicker-hover, 0.8);
    
    /* Animation and transitions - theme-aware */
    --nuraly-datepicker-local-transition-duration: var(--nuraly-transition-duration-datepicker, 0.2s);
    --nuraly-datepicker-local-transition-timing: var(--nuraly-transition-timing-datepicker, ease-in-out);
    --nuraly-datepicker-local-calendar-animation-duration: var(--nuraly-transition-duration-datepicker-calendar, 0.15s);
    
    /* Z-index - theme-aware */
    --nuraly-datepicker-local-calendar-z-index: var(--nuraly-z-index-datepicker-calendar, 1000);
    
    /* Icon sizes - theme-aware */
    --nuraly-datepicker-local-icon-size: var(--nuraly-size-datepicker-icon, 16px);
    --nuraly-datepicker-local-arrow-icon-size: var(--nuraly-size-datepicker-arrow-icon, 12px);
    
    /* Size variants - theme-aware */
    --nuraly-datepicker-local-small-font-size: var(--nuraly-font-size-datepicker-small, 12px);
    --nuraly-datepicker-local-small-padding: var(--nuraly-spacing-datepicker-small-padding, 6px 8px);
    --nuraly-datepicker-local-small-height: var(--nuraly-size-datepicker-small-height, 32px);
    --nuraly-datepicker-local-small-day-size: var(--nuraly-size-datepicker-small-day, 28px);
    
    --nuraly-datepicker-local-medium-font-size: var(--nuraly-font-size-datepicker-medium, 14px);
    --nuraly-datepicker-local-medium-padding: var(--nuraly-spacing-datepicker-medium-padding, 8px 12px);
    --nuraly-datepicker-local-medium-height: var(--nuraly-size-datepicker-medium-height, 36px);
    --nuraly-datepicker-local-medium-day-size: var(--nuraly-size-datepicker-medium-day, 36px);
    
    --nuraly-datepicker-local-large-font-size: var(--nuraly-font-size-datepicker-large, 16px);
    --nuraly-datepicker-local-large-padding: var(--nuraly-spacing-datepicker-large-padding, 12px 16px);
    --nuraly-datepicker-local-large-height: var(--nuraly-size-datepicker-large-height, 44px);
    --nuraly-datepicker-local-large-day-size: var(--nuraly-size-datepicker-large-day, 44px);
  }
`;
