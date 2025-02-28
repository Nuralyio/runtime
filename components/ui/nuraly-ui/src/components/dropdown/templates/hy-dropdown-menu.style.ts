import {css} from 'lit';

const dropdownMenuStyle = css`
  div {
    padding: var(--hybrid-dropdown-padding);
    position: relative;
    cursor: pointer;
    background-color: var(--hybrid-dropdown-background-color);
    display: flex;
    align-items: center;
  }
  hy-icon {
    display: flex;
  }
  #caret-icon {
    flex-grow: 1;
    justify-content: flex-end;
  }

  :host(:not([disabled])) div:hover {
    background-color: var(--hybrid-dropdown-hovered-background-color);
  }
  :host([disabled]) div {
    cursor: not-allowed;
    background-color: var(--hybrid-dropdown-disabled-background-color);
    color: var(--hybrid-dropdown-disabled-text-color);
  }

  ::slotted(*) {
    z-index: var(--hybrid-dropdown-menu-children-z-index);
    top: var(--hybrid-dropdown-menu-children-top);
    cursor: pointer;
  }
  :host([direction='left']) ::slotted(*) {
    right: calc(var(--hybrid-dropdown-width) - var(--hybrid-dropdown-menu-children-offset));
  }

  :host([direction='right']) ::slotted(*) {
    left: calc(var(--hybrid-dropdown-width) - var(--hybrid-dropdown-menu-children-offset));
  }

  :host(:not([icon])) .menu-label {
    padding-left: var(--hybrid-dropdown-only-text-padding-left);
  }
  :host([icon]) .menu-label {
    padding-left: var(--hybrid-dropdown-icon-and-text-padding-left);
  }
`;

export const styles = [dropdownMenuStyle];
