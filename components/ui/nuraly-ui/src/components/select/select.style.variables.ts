import { css } from 'lit';

/**
 * CSS custom properties for select component (light theme defaults)
 * These are the local component defaults that can be overridden globally
 */
export const selectVariables = css`
  :host {
    /* Layout and sizing */
    --nuraly-select-local-width: 300px;
    --nuraly-select-local-min-height: 40px;
    --nuraly-select-local-padding-top: 8px;
    --nuraly-select-local-padding-bottom: 8px;
    --nuraly-select-local-padding-left: 12px;
    --nuraly-select-local-padding-right: 12px;
    --nuraly-select-local-wrapper-margin: 0;
    --nuraly-select-local-border-radius: 6px;
    --nuraly-select-local-border-width: 1px;
    
    /* Colors - Light theme defaults */
    --nuraly-select-local-background-color: #ffffff;
    --nuraly-select-local-border-color: #d9d9d9;
    --nuraly-select-local-text-color: #262626;
    --nuraly-select-local-placeholder-color: #8c8c8c;
    --nuraly-select-local-hover-border-color: #1677ff;
    --nuraly-select-local-focus-border-color: #1677ff;
    --nuraly-select-local-error-border-color: #da1e28;
    --nuraly-select-local-warning-border-color: #f0c300;
    --nuraly-select-local-success-border-color: #52c41a;
    
    /* Dropdown colors */
    --nuraly-select-local-dropdown-background: #ffffff;
    --nuraly-select-local-dropdown-border-color: #d9d9d9;
    --nuraly-select-local-dropdown-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
    --nuraly-select-local-dropdown-z-index: 9999;
    --nuraly-select-local-dropdown-max-height: 200px;
    --nuraly-select-local-option-hover-background: #f5f5f5;
    --nuraly-select-local-option-selected-background: #e6f7ff;
    --nuraly-select-local-option-selected-color: #1677ff;
    
    /* Typography */
    --nuraly-select-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
    --nuraly-select-local-font-size: 14px;
    --nuraly-select-local-line-height: 1.5;
    --nuraly-select-local-placeholder-font-size: 14px;
    --nuraly-select-local-option-font-size: 14px;
    
    /* Icon settings */
    --nuraly-select-local-icon-size: 16px;
    --nuraly-select-local-icon-color: #8c8c8c;
    --nuraly-select-local-icon-hover-color: #1677ff;
    --nuraly-select-local-arrow-icon-size: 12px;
    
    /* Sizes */
    --nuraly-select-local-small-height: 24px;
    --nuraly-select-local-small-font-size: 12px;
    --nuraly-select-local-small-padding: 4px 8px;
    
    --nuraly-select-local-medium-height: 32px;
    --nuraly-select-local-medium-font-size: 14px;
    --nuraly-select-local-medium-padding: 4px 12px;
    
    --nuraly-select-local-large-height: 40px;
    --nuraly-select-local-large-font-size: 16px;
    --nuraly-select-local-large-padding: 6px 12px;
    
    /* States */
    --nuraly-select-local-disabled-opacity: 0.5;
    --nuraly-select-local-disabled-background: #f5f5f5;
    --nuraly-select-local-disabled-border-color: #d9d9d9;
    --nuraly-select-local-disabled-text-color: #8c8c8c;
    
    /* Animation and transitions */
    --nuraly-select-local-transition-duration: 0.2s;
    --nuraly-select-local-transition-timing: ease-in-out;
    --nuraly-select-local-dropdown-animation-duration: 0.15s;
    
    /* Multi-select specific */
    --nuraly-select-local-tag-background: #f0f0f0;
    --nuraly-select-local-tag-color: #262626;
    --nuraly-select-local-tag-border-radius: 4px;
    --nuraly-select-local-tag-padding: 2px 6px;
    --nuraly-select-local-tag-margin: 2px;
    --nuraly-select-local-tag-close-color: #8c8c8c;
    --nuraly-select-local-tag-close-hover-color: #da1e28;
    
    /* Validation message */
    --nuraly-select-local-message-font-size: 12px;
    --nuraly-select-local-message-margin-top: 4px;
    --nuraly-select-local-error-message-color: #da1e28;
    --nuraly-select-local-warning-message-color: #f0c300;
    --nuraly-select-local-success-message-color: #52c41a;
  }
`;
