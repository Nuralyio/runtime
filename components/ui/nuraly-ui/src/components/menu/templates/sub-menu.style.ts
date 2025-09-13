import { css } from 'lit';

const subMenuStyle = css`
  :host([disabled]) ul > div {
    color: var(--nuraly-sub-menu-disabled-color);
    cursor: not-allowed;
  }
  :host(:not([disabled])[highlighted]) ul > div {
    background: var(--nuraly-sub-menu-highlighted-background-color);
    color: var(--nuraly-sub-menu-highlighted-color);
  }
  :host(:not([disabled])) {
    color: var(--nuraly-sub-menu-color);
  }

  :host([icon]) span {
    margin-right: auto;
    padding-left: var(--nuraly-sub-menu-padding-left-text);
  }

  .icons-container{
    display:flex;
    align-items:center;
    position:relative;
  }
  .action-icon{
    margin-right:1px;
    --nuraly-icon-color: var(--nuraly-sub-menu-action-icon-color);
  }
  .status-icon{
    margin-right:10px;
    --nuraly-icon-color: var(--nuraly-sub-menu-status-icon-color);
  }

  #text-icon {
    --nuraly-icon-color: var(--nuraly-sub-menu-text-icon-color);
  }
  #toggle-icon {
    --nuraly-icon-color: var(--nuraly-sub-menu-toggle-icon-color);
  }

  ul {
    display: flex;
    flex-direction: column;
    margin-bottom: var(--nuraly-sub-menu-margin-y);
    margin-top: var(--nuraly-sub-menu-margin-y);
    padding-left: 0px;
  }

  :host([icon]) ::slotted(*) {
    padding-left: var(--nuraly-sub-menu-children-padding-left);
  }

  :host([icon='']) span {
    padding-left: var(--nuraly-sub-menu-empty-icon-padding-left-text);
  }

  ul > div {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    padding-top: var(--nuraly-sub-menu-padding-y);
    padding-bottom: var(--nuraly-sub-menu-padding-y);
    padding-left: var(--nuraly-sub-menu-padding-left);
  }

  :host(:not([disabled])) ul > div:focus {
    border: var(--nuraly-sub-menu-focus-border);
    color: var(--nuraly-sub-menu-focus-color);
  }

  :host(:not([disabled])) ul > div:hover {
    background-color: var(--nuraly-sub-menu-hover-background-color);
    color: var(--nuraly-sub-menu-hover-color);
  }
  :host([selected]:not([disabled])) ul > div {
    background-color: var(--nuraly-menu-selected-link-background-color);
    color: var(--nuraly-menu-focus-color);
    border-left: var(--nuraly-menu-selected-link-border);
}
  :host(:not([disabled])) ul > div:active {
    background-color: var(--nuraly-sub-menu-active-background-color);
    color: var(--nuraly-sub-menu-active-color);
  }

  
`;
export const styles = subMenuStyle;
