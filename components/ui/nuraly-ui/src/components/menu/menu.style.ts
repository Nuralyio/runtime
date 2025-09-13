import { css } from 'lit';

const menuStyle = css`
  ul {
    width: var(--nuraly-menu-width);
    padding: var(--nuraly-menu-padding);
    border: var(--nuraly-menu-border);
    font-size: var(--nuraly-menu-font-size);
    font-family: var(--nuraly-menu-font-family)
  }
  :host {
    --nuraly-menu-font-size:13px;
    --nuraly-menu-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --nuraly-menu-padding: 2px;
    --nuraly-menu-width: 45%;
    --nuraly-menu-border: 1px solid #f4f4f4;
    --nuraly-menu-link-color: #000000;
    --nuraly-menu-link-icon-color: #525252;
    --nuraly-menu-disabled-link-color: #c6c6c6;
    --nuraly-menu-focus-border: 1px solid #0f62fe;
    --nuraly-menu-focus-color: #000000;
    --nuraly-menu-active-color: #000000;
    --nuraly-menu-active-background-color: #e0e0e0;
    --nuraly-menu-hover-link-background-color: #f4f4f4;
    --nuraly-menu-hover-link-color: #000000;
    --nuraly-menu-selected-link-background-color: #e0e0e0;
    --nuraly-menu-selected-link-border: 3px solid #0f62fe;
    --nuraly-menu-selected-color: #000000;
    --nuraly-menu-link-background-color: transparent;
    --nuraly-menu-link-padding-y: 8px;
    --nuraly-menu-link-empty-icon-padding-left: 39px;
    --nuraly-menu-link-icon-padding-right: 15px;
    --nuraly-menu-link-icon-padding-left: 10px;
    --nuraly-menu-link-icon-right-padding-left: 39px;
    --nuraly-menu-link-icon-only-width: 42px;
    --nuraly-sub-menu-color: #000000;
    --nuraly-sub-menu-disabled-color: #c6c6c6;
    --nuraly-sub-menu-focus-color: #e0e0e0;
    --nuraly-sub-menu-focus-border: 1px solid #0f62fe;
    --nuraly-sub-menu-hover-background-color: #f4f4f4;
    --nuraly-sub-menu-hover-color: #161616;
    --nuraly-sub-menu-active-background-color: #c6c6c6;
    --nuraly-sub-menu-active-color: #000000;
    --nuraly-sub-menu-highlighted-color: #000000;
    --nuraly-sub-menu-highlighted-background-color: #e2e2e2;
    --nuraly-sub-menu-text-icon-color: #525252;
    --nuraly-sub-menu-action-icon-color:#525252;
    --nuraly-sub-menu-status-icon-color:#525252;
    --nuraly-sub-menu-toggle-icon-color: #525252;
    --nuraly-sub-menu-padding-y: 8px;
    --nuraly-sub-menu-margin-y: 0px;
    --nuraly-sub-menu-padding-left: 10px;
    --nuraly-sub-menu-padding-left-text: 5px;
    --nuraly-sub-menu-empty-icon-padding-left-text: 29px;
    --nuraly-sub-menu-children-padding-left: 15px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-menu-border: 1px solid #ffffff;
      --nuraly-menu-link-color:#ffffff;
      --nuraly-menu-focus-border: 1px solid #ffffff;
      --nuraly-menu-focus-color: #ffffff;
      --nuraly-menu-hover-link-background-color: #333333;
      --nuraly-menu-hover-link-color: #ffffff;
      --nuraly-menu-active-color: #ffffff;
      --nuraly-menu-active-background-color: #242424;
      --nuraly-menu-selected-link-border: 3px solid #ffffff;
      --nuraly-menu-selected-link-background-color: #3a3a3a;
      --nuraly-menu-selected-color:#ffffff;
      --nuraly-menu-disabled-link-color: #525252;
      --nuraly-sub-menu-color: #ffffff;
      --nuraly-sub-menu-disabled-color: #525252;
      --nuraly-sub-menu-focus-border: 1px solid #ffffff;
      --nuraly-sub-menu-focus-color: #525252;
      --nuraly-sub-menu-hover-background-color: #333333;
      --nuraly-sub-menu-hover-color: #ffffff;
      --nuraly-sub-menu-active-background-color: #242424;
      --nuraly-sub-menu-active-color: #ffffff;
      --nuraly-sub-menu-highlighted-color: #ffffff;
      --nuraly-sub-menu-highlighted-background-color: #3a3a3a;
      --nuraly-sub-menu-text-icon-color: #525252;
      --nuraly-sub-menu-toggle-icon-color: #525252;
    }
  }
`;
export const styles = [menuStyle];
