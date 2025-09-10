import { css } from 'lit';

/**
 * CSS custom properties for select component (light theme defaults)
 * These are the local component defaults that can be overridden globally
 */
export const selectVariables = css`
  :host {
    /* Layout and sizing */
    --hybrid-select-local-width: 300px;
    --hybrid-select-local-min-height: 40px;
    --hybrid-select-local-padding-left: 12px;
    --hybrid-select-local-padding-right: 12px;
    --hybrid-select-local-border-radius: 6px;
    --hybrid-select-local-border-width: 1px;
    
    /* Colors - Light theme defaults */
    --hybrid-select-local-background-color: #ffffff;
    --hybrid-select-local-border-color: #d9d9d9;
    --hybrid-select-local-text-color: #262626;
    --hybrid-select-local-placeholder-color: #8c8c8c;
    --hybrid-select-local-hover-border-color: #1677ff;
    --hybrid-select-local-focus-border-color: #1677ff;
    --hybrid-select-local-error-border-color: #da1e28;
    --hybrid-select-local-warning-border-color: #f0c300;
    --hybrid-select-local-success-border-color: #52c41a;
    
    /* Dropdown colors */
    --hybrid-select-local-dropdown-background: #ffffff;
    --hybrid-select-local-dropdown-border-color: #d9d9d9;
    --hybrid-select-local-dropdown-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);
    --hybrid-select-local-option-hover-background: #f5f5f5;
    --hybrid-select-local-option-selected-background: #e6f7ff;
    --hybrid-select-local-option-selected-color: #1677ff;
    
    /* Typography */
    --hybrid-select-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
    --hybrid-select-local-font-size: 14px;
    --hybrid-select-local-line-height: 1.5;
    --hybrid-select-local-placeholder-font-size: 14px;
    --hybrid-select-local-option-font-size: 14px;
    
    /* Icon settings */
    --hybrid-select-local-icon-size: 16px;
    --hybrid-select-local-icon-color: #8c8c8c;
    --hybrid-select-local-icon-hover-color: #1677ff;
    --hybrid-select-local-arrow-icon-size: 12px;
    
    /* Sizes */
    --hybrid-select-local-small-height: 24px;
    --hybrid-select-local-small-font-size: 12px;
    --hybrid-select-local-small-padding: 4px 8px;
    
    --hybrid-select-local-medium-height: 32px;
    --hybrid-select-local-medium-font-size: 14px;
    --hybrid-select-local-medium-padding: 4px 12px;
    
    --hybrid-select-local-large-height: 40px;
    --hybrid-select-local-large-font-size: 16px;
    --hybrid-select-local-large-padding: 6px 12px;
    
    /* States */
    --hybrid-select-local-disabled-opacity: 0.5;
    --hybrid-select-local-disabled-background: #f5f5f5;
    --hybrid-select-local-disabled-border-color: #d9d9d9;
    --hybrid-select-local-disabled-text-color: #8c8c8c;
    
    /* Animation and transitions */
    --hybrid-select-local-transition-duration: 0.2s;
    --hybrid-select-local-transition-timing: ease-in-out;
    --hybrid-select-local-dropdown-animation-duration: 0.15s;
    
    /* Multi-select specific */
    --hybrid-select-local-tag-background: #f0f0f0;
    --hybrid-select-local-tag-color: #262626;
    --hybrid-select-local-tag-border-radius: 4px;
    --hybrid-select-local-tag-padding: 2px 6px;
    --hybrid-select-local-tag-margin: 2px;
    --hybrid-select-local-tag-close-color: #8c8c8c;
    --hybrid-select-local-tag-close-hover-color: #da1e28;
    
    /* Validation message */
    --hybrid-select-local-message-font-size: 12px;
    --hybrid-select-local-message-margin-top: 4px;
    --hybrid-select-local-error-message-color: #da1e28;
    --hybrid-select-local-warning-message-color: #f0c300;
    --hybrid-select-local-success-message-color: #52c41a;
  }
`;
