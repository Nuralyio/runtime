import { css } from 'lit';

const dropdownStyle = css`
  .dropdown-container {
    display: none;
    z-index:1;
      border-radius: var(--nuraly-dropdown-border-radius, var(--nuraly-dropdown-border-radius));
      font-family: var(--nuraly-dropdown-font-family, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;);
  }
  :host {
    cursor: pointer;
  }

  :host([show]) .dropdown-container {
    display: block;
    position: absolute;
    width: var(--nuraly-dropdown-width);
    box-shadow: var(--nuraly-dropdown-box-shadow);
  }
  :host {
    --nuraly-icon-color: #5d5d5d;
    --nuraly-dropdown-width: 150px;
    --nuraly-dropdown-box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.1);
    --nuraly-dropdown-padding: 10px;
    --nuraly-dropdown-background-color: #f4f4f4;
    --nuraly-dropdown-hovered-background-color: #e4e3e3;
    --nuraly-dropdown-text-color: #000000;
    --nuraly-dropdown-disabled-background-color: #f4f4f4;
    --nuraly-dropdown-disabled-text-color: rgba(0, 0, 0, 0.5);
    --nuraly-dropdown-only-text-padding-left: 18px;
    --nuraly-dropdown-icon-and-text-padding-left: 4px;
    --nuraly-dropdown-menu-children-top: 0px;
    --nuraly-dropdown-menu-children-offset: 0px;
    --nuraly-dropdown-menu-children-z-index: 2;
      --nuraly-dropdown-font-size-local: 13px;
      --nuraly-dropdown-border-radius   : 0px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-dropdown-background-color: #232323;
      --nuraly-dropdown-hovered-background-color: #2b2b2b;
      --nuraly-dropdown-disabled-background-color: #6f6f6f;
      --nuraly-dropdown-text-color: #f4f4f4;
    }
  }
`;
export const styles = dropdownStyle;
