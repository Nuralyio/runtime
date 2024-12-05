import {css} from 'lit';

const dropdownStyle = css`
  .dropdown-container {
    display: none;
    z-index:1;
      border-radius: var(--hybrid-dropdown-border-radius, var(--hybrid-dropdown-border-radius));
      font-family: var(--hybrid-dropdown-font-family, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;);
  }
  :host {
    cursor: pointer;
  }

  :host([show]) .dropdown-container {
    display: block;
    position: absolute;
    width: var(--hybrid-dropdown-width);
    box-shadow: var(--hybrid-dropdown-box-shadow);
  }
  :host {
    --hybrid-dropdown-width: 150px;
    --hybrid-dropdown-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.1);
    --hybrid-dropdown-padding: 10px;
    --hybrid-dropdown-background-color: #e0e0e0;
    --hybrid-dropdown-hovered-background-color: #8d8d8d;
    --hybrid-dropdown-text-color: #000000;
    --hybrid-dropdown-disabled-background-color: #f4f4f4;
    --hybrid-dropdown-disabled-text-color: rgba(0, 0, 0, 0.5);
    --hybrid-dropdown-only-text-padding-left: 18px;
    --hybrid-dropdown-icon-and-text-padding-left: 4px;
    --hybrid-dropdown-menu-children-top: 10px;
    --hybrid-dropdown-menu-children-offset: 5px;
    --hybrid-dropdown-menu-children-z-index: 2;
      --hybrid-dropdown-font-size-local: 13px;
      --hybrid-dropdown-border-radius   : 0px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-dropdown-background-color: #1b1b1b;
      --hybrid-dropdown-hovered-background-color: #4c4c4c;
      --hybrid-dropdown-disabled-background-color: #6f6f6f;
      --hybrid-dropdown-text-color: #f4f4f4;
    }
  }
`;
export const styles = dropdownStyle;
