import {css} from 'lit';
const collapseStyles = css`
    hy-label{
    display: inline-block;  
    }
    hy-icon{
        --hybrid-icon-width: 11px;
        --hybrid-icon-height: 11px;
    }
  .disabled-header {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .collapse-section {
    display:block;
    margin-top:1px;
    width:var(--hy-collapse-width,var(--hy-collapse-local-width));
    border: var(--hy-collapse-border,var(--hy-collapse-local-border));
    border-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
  }

  .collapse-icon {
  }

  .header {
    border-top-left-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
    border-top-right-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
    display: flex;
    align-items: center;
    gap: 5px;
    padding: var(--hy-collapse-header-default-size-padding-y,var(--hy-collapse-local-header-default-size-padding-y)) var(--hy-collapse-header-default-size-padding-x,var(--hy-collapse-local-header-default-size-padding-x));
    background-color: var(--hy-collapse-header-background-color,var(--hy-collapse-local-header-background-color));
    font-weight: var(--hy-collapse-header-font-weight,var(--hy-collapse-local-header-font-weight));
    font-size:var(--hy-collapse-header-font-size,var(--hy-collapse-local-header-font-size));
    color: var(--hy-collapse-header-color,var(--hy-collapse-local-header-color));
  }

  .collapse-small > .header {
    padding: var(--hy-collapse-header-small-size-padding-y,var(--hy-collapse-local-header-small-size-padding-y)) var(--hy-collapse-header-small-size-padding-x,var(--hy-collapse-local-header-small-size-padding-x));
  }

  .collapse-small > .content {
    padding: var(--hy-collapse-content-small-size-padding,var(--hy-collapse-local-content-small-size-padding));
  }

  .collapse-large > .header {
    padding: var(--hy-collapse-header-large-size-padding-y,var(--hy-collapse-local-header-large-size-padding-y)) var(--hy-collapse-header-large-size-padding-x,var(--hy-collapse-local-header-large-size-padding-x));
  }

  .collapse-large > .content {
    padding: var(--hy-collapse-content-large-size-padding,var(--hy-collapse-local-content-large-size-padding));
  }

  .header:not(.disabled-header) {
    cursor: pointer;
  }
  .header:not(.disabled-header):hover {
    background-color: var(--hy-collapse-header-hover-background-color,var(--hy-collapse-local-header-hover-background-color));
  }
  .collapsed-header {
    background-color: var(--hy-collapse-header-collapsed-background-color,var(--hy-collapse-local-header-collapsed-background-color));
  }
  .fold-header {
    border-bottom-left-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
    border-bottom-right-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
  }

  .content {
    padding: var(--hy-collapse-content-default-size-padding,var(--hy-collapse-local-content-default-size-padding));
    background-color: var(--hy-collapse-content-background-color,var(--hy-collapse-local-content-background-color));
    color: var(--hy-collapse-content-color,var(--hy-collapse-local-content-color));
    border-bottom-left-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
    border-bottom-right-radius:var(--hy-collapse-border-radius,var(--hy-collapse-local-border-radius));
  }
  :host {
      --hybrid-icon-width: 8px;
    --hy-collapse-local-content-background-color: #ffffff;
    --hy-collapse-local-header-background-color: #fafafa;
    --hy-collapse-local-content-color: #000000;
    --hy-collapse-local-header-color: #000000;
    --hy-collapse-local-header-collapsed-background-color: #d3d3d3;
    --hy-collapse-local-header-hover-background-color: #e0e0e0;
    --hy-collapse-local-border: 1px solid #bfbfbf;
    --hy-collapse-local-font-weight: bold;
    --hy-collapse-local-header-font-size: 14px;

    --hy-collapse-local-width:auto;
    --hy-collapse-local-border-radius:5px;
   
    --hy-collapse-local-header-default-size-padding-y: 4px;
    --hy-collapse-local-header-default-size-padding-x: 6px;
    --hy-collapse-local-content-default-size-padding: 6px;

    --hy-collapse-local-header-small-size-padding-y: 5px;
    --hy-collapse-local-header-small-size-padding-x: 11px;
    --hy-collapse-local-content-small-size-padding: 11px;

    --hy-collapse-local-header-large-size-padding-y: 13px;
    --hy-collapse-local-header-large-size-padding-x: 19px;
    --hy-collapse-local-content-large-size-padding: 19px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hy-collapse-local-content-background-color: #1f1f1f;
      --hy-collapse-local-header-background-color: #2a2a2a;
      --hy-collapse-local-header-color: #ffffff;
      --hy-collapse-local-content-color: #ffffff;
      --hy-collapse-local-header-collapsed-background-color: #4a4a4a;
      --hy-collapse-local-header-hover-background-color: #505050;
      --hy-collapse-local-border: 1px solid #d9d9d9;
    }
  }
`;

export const styles = collapseStyles;
