import { css } from 'lit';

const dropdownMenuStyle = css`
  div {
    padding: var(--nuraly-dropdown-padding);
    position: relative;
    cursor: pointer;
    background-color: var(--nuraly-dropdown-background-color);
    display: flex;
    align-items: center;
  }
  nr-icon {
    display: flex;
  }
  #caret-icon {
    flex-grow: 1;
    justify-content: flex-end;
  }

  :host(:not([disabled])) div:hover {
    background-color: var(--nuraly-dropdown-hovered-background-color);
  }
  :host([disabled]) div {
    cursor: not-allowed;
    background-color: var(--nuraly-dropdown-disabled-background-color);
    color: var(--nuraly-dropdown-disabled-text-color);
  }

  ::slotted(*) {
    z-index: var(--nuraly-dropdown-menu-children-z-index);
    top: var(--nuraly-dropdown-menu-children-top);
    cursor: pointer;
  }
  :host([direction='left']) ::slotted(*) {
    right: calc(var(--nuraly-dropdown-width) - var(--nuraly-dropdown-menu-children-offset));
  }

  :host([direction='right']) ::slotted(*) {
    left: calc(var(--nuraly-dropdown-width) - var(--nuraly-dropdown-menu-children-offset));
  }

  :host(:not([icon])) .menu-label {
    padding-left: var(--nuraly-dropdown-only-text-padding-left);
  }
  :host([icon]) .menu-label {
    padding-left: var(--nuraly-dropdown-icon-and-text-padding-left);
  }
`;

export const styles = [dropdownMenuStyle];
