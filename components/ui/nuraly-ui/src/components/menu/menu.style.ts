import { css } from 'lit';

const menuStyle = css`
  /* Root menu container */
  :host {
    display: block;
  }

  .menu-root {
    font-size: var(--nuraly-menu-font-size);
    font-family: var(--nuraly-menu-font-family);
    font-weight: var(--nuraly-menu-font-weight);
    line-height: var(--nuraly-menu-line-height);
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Menu Link Styles */
  .menu-link {
    list-style: none;
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: var(--nuraly-menu-link-padding-vertical) var(--nuraly-menu-link-padding-horizontal);
    color: var(--nuraly-menu-link-color);
    background-color: var(--nuraly-menu-link-background-color);
    border-left: 4px solid transparent;
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    border-radius: var(--nuraly-menu-border-radius);
    transition: background-color var(--nuraly-menu-transition-duration) var(--nuraly-menu-transition-timing),
                color var(--nuraly-menu-transition-duration) var(--nuraly-menu-transition-timing),
                border-color var(--nuraly-menu-transition-duration) var(--nuraly-menu-transition-timing);
  }

  .menu-link.disabled {
    color: var(--nuraly-menu-disabled-link-color);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .menu-link:not(.disabled):not(.selected):hover {
    background-color: var(--nuraly-menu-hover-link-background-color);
    color: var(--nuraly-menu-hover-link-color);
  }

  .menu-link.selected {
    background-color: var(--nuraly-menu-selected-link-background-color);
    color: var(--nuraly-menu-selected-color);
    border-left: var(--nuraly-menu-selected-link-border);
  }

  .menu-link:not(.disabled):not(.selected):focus {
    outline: none;
    border-left: 4px solid transparent;
    border-top: var(--nuraly-menu-focus-border);
    border-right: var(--nuraly-menu-focus-border);
    border-bottom: var(--nuraly-menu-focus-border);
    color: var(--nuraly-menu-focus-color);
  }

  .menu-link.selected:not(.disabled):focus {
    outline: none;
    border-left: var(--nuraly-menu-selected-link-border);
    border-top: var(--nuraly-menu-focus-border);
    border-right: var(--nuraly-menu-focus-border);
    border-bottom: var(--nuraly-menu-focus-border);
    color: var(--nuraly-menu-focus-color);
  }

  .menu-link:not(.disabled):not(.selected):active {
    color: var(--nuraly-menu-active-color);
    background-color: var(--nuraly-menu-active-background-color);
  }

  .menu-link.selected:not(.disabled):active {
    background-color: var(--nuraly-menu-active-background-color);
    color: var(--nuraly-menu-active-color);
    border-left: var(--nuraly-menu-selected-link-border) !important;
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
  }

  .menu-link .action-text-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .menu-link .text-container {
    flex: 1;
    min-width: 0;
  }

  .menu-link nr-icon {
    display: flex;
    align-items: center;
    --nuraly-icon-color: var(--nuraly-menu-link-icon-color);
  }

  .menu-link nr-icon:first-child {
    padding-right: var(--nuraly-menu-icon-padding-right);
    padding-left: var(--nuraly-menu-icon-padding-left);
  }

  /* Sub Menu Styles */
  .sub-menu {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    list-style: none;
    color: var(--nuraly-sub-menu-color);
  }

  .sub-menu.disabled .sub-menu-header {
    color: var(--nuraly-sub-menu-disabled-color);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .sub-menu.highlighted .sub-menu-header {
    background-color: var(--nuraly-sub-menu-highlighted-background-color);
    color: var(--nuraly-sub-menu-highlighted-color);
  }

  .sub-menu .sub-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: var(--nuraly-sub-menu-padding-vertical) var(--nuraly-sub-menu-padding-horizontal);
    border-left: 4px solid transparent;
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    border-radius: var(--nuraly-menu-border-radius);
    transition: background-color var(--nuraly-menu-transition-duration) var(--nuraly-menu-transition-timing),
                color var(--nuraly-menu-transition-duration) var(--nuraly-menu-transition-timing),
                border-color var(--nuraly-menu-transition-duration) var(--nuraly-menu-transition-timing);
  }

  .sub-menu .sub-menu-header span {
    flex: 1;
    min-width: 0;
    padding-left: var(--nuraly-sub-menu-icon-padding-right);
  }

  .sub-menu .text-icon {
    flex-shrink: 0;
  }

  .sub-menu .icons-container {
    display: flex;
    align-items: center;
    gap: var(--nuraly-sub-menu-icon-padding-right);
    position: relative;
    flex-shrink: 0;
    /* Reserve space for dropdown to prevent layout shift */
    min-width: fit-content;
    /* Fixed height to prevent vertical shifting */
    height: 100%;
    min-height: 24px;
  }

  .menu-link .icon-container {
    display: flex;
    align-items: center;
    position: relative;
    flex-shrink: 0;
    /* Fixed height to prevent vertical shifting */
    height: 100%;
    min-height: 24px;
  }

  .sub-menu nr-dropdown,
  .menu-link nr-dropdown {
    /* Keep in normal flow but ensure it doesn't grow/shrink */
    display: inline-flex;
    flex-shrink: 0;
    flex-grow: 0;
    align-items: center;
    vertical-align: middle;
  }

  .sub-menu .action-icon,
  .menu-link .action-icon {
    flex-shrink: 0;
    cursor: pointer;
  }

  .sub-menu .action-icon {
    --nuraly-icon-color: var(--nuraly-sub-menu-action-icon-color);
  }

  .sub-menu .status-icon {
    --nuraly-icon-color: var(--nuraly-sub-menu-status-icon-color);
  }

  .sub-menu .text-icon {
    --nuraly-icon-color: var(--nuraly-sub-menu-text-icon-color);
  }

  .sub-menu #toggle-icon {
    --nuraly-icon-color: var(--nuraly-sub-menu-toggle-icon-color);
  }

  .sub-menu:not(.disabled):not(.selected) .sub-menu-header:focus {
    outline: none;
    border-left: 4px solid transparent;
    border-top: var(--nuraly-sub-menu-focus-border);
    border-right: var(--nuraly-sub-menu-focus-border);
    border-bottom: var(--nuraly-sub-menu-focus-border);
    color: var(--nuraly-sub-menu-focus-color);
  }

  .sub-menu.selected:not(.disabled) .sub-menu-header:focus {
    outline: none;
    border-left: var(--nuraly-menu-selected-link-border);
    border-top: var(--nuraly-sub-menu-focus-border);
    border-right: var(--nuraly-sub-menu-focus-border);
    border-bottom: var(--nuraly-sub-menu-focus-border);
    color: var(--nuraly-sub-menu-focus-color);
  }

  .sub-menu:not(.disabled) .sub-menu-header:hover {
    background-color: var(--nuraly-sub-menu-hover-background-color);
    color: var(--nuraly-sub-menu-hover-color);
  }

  .sub-menu.selected:not(.disabled) .sub-menu-header {
    background-color: var(--nuraly-menu-selected-link-background-color);
    color: var(--nuraly-menu-selected-color);
    border-left: var(--nuraly-menu-selected-link-border);
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
  }

  .sub-menu.selected:not(.disabled) .sub-menu-header:active {
    background-color: var(--nuraly-sub-menu-active-background-color);
    color: var(--nuraly-sub-menu-active-color);
    border-left: var(--nuraly-menu-selected-link-border);
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
  }

  .sub-menu:not(.disabled):not(.selected) .sub-menu-header:active {
    background-color: var(--nuraly-sub-menu-active-background-color);
    color: var(--nuraly-sub-menu-active-color);
  }

  .sub-menu-children {
    padding-left: var(--nuraly-sub-menu-nested-padding-left);
  }

  /* Size Variants */
  .menu--small .menu-link {
    padding: var(--nuraly-menu-link-padding-vertical-small) var(--nuraly-menu-link-padding-horizontal-small);
  }

  .menu--small .sub-menu .sub-menu-header {
    padding: var(--nuraly-sub-menu-padding-vertical-small) var(--nuraly-sub-menu-padding-horizontal-small);
  }

  .menu--medium .menu-link {
    padding: var(--nuraly-menu-link-padding-vertical-medium) var(--nuraly-menu-link-padding-horizontal-medium);
  }

  .menu--medium .sub-menu .sub-menu-header {
    padding: var(--nuraly-sub-menu-padding-vertical-medium) var(--nuraly-sub-menu-padding-horizontal-medium);
  }

  .menu--large .menu-link {
    padding: var(--nuraly-menu-link-padding-vertical-large) var(--nuraly-menu-link-padding-horizontal-large);
  }

  .menu--large .sub-menu .sub-menu-header {
    padding: var(--nuraly-sub-menu-padding-vertical-large) var(--nuraly-sub-menu-padding-horizontal-large);
  }
`;

export const styles = [menuStyle];
