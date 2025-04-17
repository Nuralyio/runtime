import { css } from 'lit';

const subMenuStyle = css`
  :host([disabled]) ul > div {
    color: var(--hybrid-sub-menu-disabled-color);
    cursor: not-allowed;
  }
  :host(:not([disabled])[highlighted]) ul > div {
    background: var(--hybrid-sub-menu-highlighted-background-color);
    color: var(--hybrid-sub-menu-highlighted-color);
  }
  :host(:not([disabled])) {
    color: var(--hybrid-sub-menu-color);
  }

  :host([icon]) span {
    margin-right: auto;
    padding-left: var(--hybrid-sub-menu-padding-left-text);
  }

  .icons-container{
    display:flex;
    align-items:center;
    position:relative;
  }
  .action-icon{
    margin-right:1px;
    --hybrid-icon-color: var(--hybrid-sub-menu-action-icon-color);
  }
  .status-icon{
    margin-right:10px;
    --hybrid-icon-color: var(--hybrid-sub-menu-status-icon-color);
  }

  #text-icon {
    --hybrid-icon-color: var(--hybrid-sub-menu-text-icon-color);
  }
  #toggle-icon {
    --hybrid-icon-color: var(--hybrid-sub-menu-toggle-icon-color);
  }

  ul {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--hybrid-sub-menu-margin-y);
    margin-top: var(--hybrid-sub-menu-margin-y);
    padding-left: 0px;
  }

  :host([icon]) ::slotted(*) {
    padding-left: var(--hybrid-sub-menu-children-padding-left);
  }

  :host([icon='']) span {
    padding-left: var(--hybrid-sub-menu-empty-icon-padding-left-text);
  }

  ul > div {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    padding-top: var(--hybrid-sub-menu-padding-y);
    padding-bottom: var(--hybrid-sub-menu-padding-y);
    padding-left: var(--hybrid-sub-menu-padding-left);
  }

  :host(:not([disabled])) ul > div:focus {
    border: var(--hybrid-sub-menu-focus-border);
    color: var(--hybrid-sub-menu-focus-color);
  }

  :host(:not([disabled])) ul > div:hover {
    background-color: var(--hybrid-sub-menu-hover-background-color);
    color: var(--hybrid-sub-menu-hover-color);
  }
  :host([selected]:not([disabled])) ul > div {
    background-color: var(--hybrid-menu-selected-link-background-color);
    color: var(--hybrid-menu-focus-color);
    border-left: var(--hybrid-menu-selected-link-border);
}
  :host(:not([disabled])) ul > div:active {
    background-color: var(--hybrid-sub-menu-active-background-color);
    color: var(--hybrid-sub-menu-active-color);
  }

  
`;
export const styles = subMenuStyle;
