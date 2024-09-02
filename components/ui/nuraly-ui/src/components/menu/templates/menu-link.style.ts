import {css} from 'lit';
const menuLinkStyle = css`
  :host([disabled]) li {
    color: var(--hybrid-menu-disabled-link-color);
    cursor: not-allowed;
  }

  :host(:not([disabled]):not([selected])) li {
    background-color: var(--hybrid-menu-link-background-color);
  }

  :host(:not([disabled]):not([selected])) li:hover {
    background-color: var(--hybrid-menu-hover-link-background-color);
    color: var(--hybrid-menu-hover-link-color);
  }

  :host([selected]) li:not(:focus) {
    background-color: var(--hybrid-menu-selected-link-background-color);
    color: var(--hybrid-menu-selected-color);
    border-left: var(--hybrid-menu-selected-link-border);
  }

  :host(:not([disabled])) li {
    color: var(--hybrid-menu-link-color);
  }

  :host([text='']) li {
    width: var(--hybrid-menu-link-icon-only-width);
  }
  hy-icon {
    --hybrid-icon-color: var(--hybrid-menu-link-icon-color);
  }
   .icon-container{
    display:flex;
    align-items:center;
    margin-right:3px;
   }
  li {
    list-style: none;
    display: flex;
    cursor: pointer;
    padding-bottom: var(--hybrid-menu-link-padding-y);
    padding-top: var(--hybrid-menu-link-padding-y);
  }

  :host([iconPosition='right']) li {
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  :host(:not([disabled])) li:focus {
    border: var(--hybrid-menu-focus-border);
    color: var(--hybrid-menu-focus-color);
  }

  :host(:not([disabled]):not([selected])) li:active {
    color: var(--hybrid-menu-active-color);
    background-color: var(--hybrid-menu-active-background-color);
  }

  :host([icon='']) #text-container {
    padding-left: var(--hybrid-menu-link-empty-icon-padding-left);
  }
  :host([icon=''][iconPosition='right']) #text-container {
    margin-right: auto;
  }

  :host([iconPosition='right']) #text-container,
  :host([iconPosition='right']) #icon-only {
    padding-left: var(--hybrid-menu-link-icon-right-padding-left);
  }

  #link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  hy-icon {
    display: flex;
    align-items: center;
    padding-right: var(--hybrid-menu-link-icon-padding-right);
    padding-left: var(--hybrid-menu-link-icon-padding-left);
  }
`;
export const styles = menuLinkStyle;
