import { css } from 'lit';

const menuStyle = css`
  ul {
    width: var(--hybrid-menu-width);
    padding: var(--hybrid-menu-padding);
    border: var(--hybrid-menu-border);
    font-size: var(--hybrid-menu-font-size);
    font-family: var(--hybrid-menu-font-family)
  }
  :host {
    --hybrid-menu-font-size:13px;
    --hybrid-menu-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --hybrid-menu-padding: 2px;
    --hybrid-menu-width: 45%;
    --hybrid-menu-border: 1px solid #f4f4f4;
    --hybrid-menu-link-color: #000000;
    --hybrid-menu-link-icon-color: #525252;
    --hybrid-menu-disabled-link-color: #c6c6c6;
    --hybrid-menu-focus-border: 1px solid #0f62fe;
    --hybrid-menu-focus-color: #000000;
    --hybrid-menu-active-color: #000000;
    --hybrid-menu-active-background-color: #e0e0e0;
    --hybrid-menu-hover-link-background-color: #f4f4f4;
    --hybrid-menu-hover-link-color: #000000;
    --hybrid-menu-selected-link-background-color: #e0e0e0;
    --hybrid-menu-selected-link-border: 3px solid #0f62fe;
    --hybrid-menu-selected-color: #000000;
    --hybrid-menu-link-background-color: transparent;
    --hybrid-menu-link-padding-y: 8px;
    --hybrid-menu-link-empty-icon-padding-left: 39px;
    --hybrid-menu-link-icon-padding-right: 15px;
    --hybrid-menu-link-icon-padding-left: 10px;
    --hybrid-menu-link-icon-right-padding-left: 39px;
    --hybrid-menu-link-icon-only-width: 42px;
    --hybrid-sub-menu-color: #000000;
    --hybrid-sub-menu-disabled-color: #c6c6c6;
    --hybrid-sub-menu-focus-color: #e0e0e0;
    --hybrid-sub-menu-focus-border: 1px solid #0f62fe;
    --hybrid-sub-menu-hover-background-color: #f4f4f4;
    --hybrid-sub-menu-hover-color: #161616;
    --hybrid-sub-menu-active-background-color: #c6c6c6;
    --hybrid-sub-menu-active-color: #000000;
    --hybrid-sub-menu-highlighted-color: #000000;
    --hybrid-sub-menu-highlighted-background-color: #e2e2e2;
    --hybrid-sub-menu-text-icon-color: #525252;
    --hybrid-sub-menu-action-icon-color:#525252;
    --hybrid-sub-menu-status-icon-color:#525252;
    --hybrid-sub-menu-toggle-icon-color: #525252;
    --hybrid-sub-menu-padding-y: 8px;
    --hybrid-sub-menu-margin-y: 0px;
    --hybrid-sub-menu-padding-left: 10px;
    --hybrid-sub-menu-padding-left-text: 5px;
    --hybrid-sub-menu-empty-icon-padding-left-text: 29px;
    --hybrid-sub-menu-children-padding-left: 15px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-menu-border: 1px solid #ffffff;
      --hybrid-menu-link-color:#ffffff;
      --hybrid-menu-focus-border: 1px solid #ffffff;
      --hybrid-menu-focus-color: #ffffff;
      --hybrid-menu-hover-link-background-color: #333333;
      --hybrid-menu-hover-link-color: #ffffff;
      --hybrid-menu-active-color: #ffffff;
      --hybrid-menu-active-background-color: #242424;
      --hybrid-menu-selected-link-border: 3px solid #ffffff;
      --hybrid-menu-selected-link-background-color: #3a3a3a;
      --hybrid-menu-selected-color:#ffffff;
      --hybrid-menu-disabled-link-color: #525252;
      --hybrid-sub-menu-color: #ffffff;
      --hybrid-sub-menu-disabled-color: #525252;
      --hybrid-sub-menu-focus-border: 1px solid #ffffff;
      --hybrid-sub-menu-focus-color: #525252;
      --hybrid-sub-menu-hover-background-color: #333333;
      --hybrid-sub-menu-hover-color: #ffffff;
      --hybrid-sub-menu-active-background-color: #242424;
      --hybrid-sub-menu-active-color: #ffffff;
      --hybrid-sub-menu-highlighted-color: #ffffff;
      --hybrid-sub-menu-highlighted-background-color: #3a3a3a;
      --hybrid-sub-menu-text-icon-color: #525252;
      --hybrid-sub-menu-toggle-icon-color: #525252;
    }
  }
`;
export const styles = [menuStyle];
