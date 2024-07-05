import {css} from 'lit';

const dropdownItemStyle = css`
  div {
    padding: var(--hybrid-dropdown-padding);
    cursor: pointer;
    background-color: var(--hybrid-dropdown-background-color);
    display: flex;
    align-items: center;
    color: var(--hybrid-dropdown-text-color);
  }
  hy-icon {
    display: flex;
  }
  :host(:not([disabled])) div:hover {
    background-color: var(--hybrid-dropdown-hovered-background-color);
  }
  :host([disabled]) div {
    background-color: var(--hybrid-dropdown-disabled-background-color);
    cursor: not-allowed;
    color: var(--hybrid-dropdown-disabled-text-color);
  }

  :host(:not([icon])) .option-label {
    padding-left: var(--hybrid-dropdown-only-text-padding-left);
  }
  :host([icon]) .option-label {
    padding-left: var(--hybrid-dropdown-icon-and-text-padding-left);
  }
`;

export const styles = [dropdownItemStyle];
