import {css} from 'lit';
const collapseStyles = css`
  .disabled-header {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .collapse-section {
    border: 1px solid #d9d9d9;
    margin-bottom: 2px;
    border-radius: 2px;
  }

  .collapse-icon {
    display: flex;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: var(--hy-collapse-header-default-size-padding-y) var(--hy-collapse-header-default-size-padding-x);
    background-color: var(--hy-collapse-header-background-color);
    font-weight: bold;
    color: var(--hy-collapse-header-color);
  }

  .collapse-small > .header {
    padding: var(--hy-collapse-header-small-size-padding-y) var(--hy-collapse-header-small-size-padding-x);
  }

  .collapse-small > .content {
    padding: var(--hy-collapse-content-small-size-padding);
  }

  .collapse-large > .header {
    padding: var(--hy-collapse-header-large-size-padding-y) var(--hy-collapse-header-large-size-padding-x);
  }

  .collapse-large > .content {
    padding: var(--hy-collapse-content-large-size-padding);
  }

  .header:not(.disabled-header) {
    cursor: pointer;
  }
  .header:not(.disabled-header):hover {
    background-color: var(--hy-collapse-header-hover-background-color);
  }
  .collapsed-header {
    background-color: var(--hy-collapse-header-collapsed-background-color);
  }

  .content {
    padding: var(--hy-collapse-content-default-size-padding);
    background-color: var(--hy-collapse-content-background-color);
    border-top: var(--hy-collapse-content-border-top);
    color: var(--hy-collapse-content-color);
  }
  :host {
    --hy-collapse-content-background-color: #ffffff;
    --hy-collapse-header-background-color: #fafafa;
    --hy-collapse-content-color: #000000;
    --hy-collapse-header-color: #000000;
    --hy-collapse-header-collapsed-background-color: #d3d3d3;
    --hy-collapse-header-hover-background-color: #e0e0e0;
    --hy-collapse-content-border-top: 1px solid #bfbfbf;

    --hy-collapse-header-default-size-padding-y: 9px;
    --hy-collapse-header-default-size-padding-x: 15px;
    --hy-collapse-content-default-size-padding: 15px;

    --hy-collapse-header-small-size-padding-y: 5px;
    --hy-collapse-header-small-size-padding-x: 11px;
    --hy-collapse-content-small-size-padding: 11px;

    --hy-collapse-header-large-size-padding-y: 13px;
    --hy-collapse-header-large-size-padding-x: 19px;
    --hy-collapse-content-large-size-padding: 19px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hy-collapse-content-background-color: #1f1f1f;
      --hy-collapse-header-background-color: #2a2a2a;
      --hy-collapse-header-color: #ffffff;
      --hy-collapse-content-color: #ffffff;
      --hy-collapse-header-collapsed-background-color: #4a4a4a;
      --hy-collapse-header-hover-background-color: #505050;
      --hy-collapse-content-border-top: 1px solid #d9d9d9;
    }
  }
`;

export const styles = collapseStyles;
