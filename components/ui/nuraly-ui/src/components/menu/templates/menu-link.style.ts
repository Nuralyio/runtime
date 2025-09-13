import { css } from 'lit';
const menuLinkStyle = css`
  :host([disabled]) li {
    color: var(--nuraly-menu-disabled-link-color);
    cursor: not-allowed;
  }

  :host(:not([disabled]):not([selected])) li {
    background-color: var(--nuraly-menu-link-background-color);
  }

  :host(:not([disabled]):not([selected])) li:hover {
    background-color: var(--nuraly-menu-hover-link-background-color);
    color: var(--nuraly-menu-hover-link-color);
  }

  :host([selected]) li:not(:focus) {
    background-color: var(--nuraly-menu-selected-link-background-color);
    color: var(--nuraly-menu-selected-color);
    border-left: var(--nuraly-menu-selected-link-border);
  }

  :host(:not([disabled])) li {
    color: var(--nuraly-menu-link-color);
  }

  :host([text='']) li {
    width: var(--nuraly-menu-link-icon-only-width);
  }
  nr-icon {
    --nuraly-icon-color: var(--nuraly-menu-link-icon-color);
  }
   .icon-container{
    display:flex;
    align-items:center;
    position:relative;
   }
   
   .status-icon{
    padding-right:0px;
   }

  li {
    list-style: none;
    display: flex;
    cursor: pointer;
    padding-bottom: var(--nuraly-menu-link-padding-y);
    padding-top: var(--nuraly-menu-link-padding-y);
  }
  .action-text-container{
    width:100%;
    display:flex;
    justify-content:space-between;
  }

  :host([iconPosition='right']) li {
    flex-direction: row-reverse;
    justify-content: space-between;
  }

  :host(:not([disabled])) li:focus {
    /* border: var(--nuraly-menu-focus-border); */
    background-color: var(--nuraly-menu-active-background-color);
    color: var(--nuraly-menu-focus-color);
    border-left: var(--nuraly-menu-selected-link-border);
  }

  :host(:not([disabled]):not([selected])) li:active {
    color: var(--nuraly-menu-active-color);
    background-color: var(--nuraly-menu-active-background-color);
  }

  :host([icon='']) #text-container {
    padding-left: var(--nuraly-menu-link-empty-icon-padding-left);
  }
  :host([icon=''][iconPosition='right']) #text-container {
    margin-right: auto;
  }

  :host([iconPosition='right']) #text-container,
  :host([iconPosition='right']) #icon-only {
    padding-left: var(--nuraly-menu-link-icon-right-padding-left);
  }

  #link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  nr-icon {
    display: flex;
    align-items: center;
    padding-right: var(--nuraly-menu-link-icon-padding-right);
    padding-left: var(--nuraly-menu-link-icon-padding-left);
  }
`;
export const styles = menuLinkStyle;
