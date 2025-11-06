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
    padding: var(--nuraly-menu-link-padding, 1px);
    color: var(--nuraly-menu-link-color);
    background-color: var(--nuraly-menu-link-background-color);
    border-left: 4px solid transparent;
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    border-radius: var(--nuraly-menu-border-radius);
    margin-bottom: 4px;
    gap: 8px;
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

  /* Focus-visible for keyboard navigation */
  .menu-link:not(.disabled):focus-visible {
    outline: none;
    border-top: var(--nuraly-menu-focus-border);
    border-right: var(--nuraly-menu-focus-border);
    border-bottom: var(--nuraly-menu-focus-border);
  }

  .menu-link:not(.disabled):not(.selected):focus-visible {
    border-left: var(--nuraly-menu-focus-border);
    color: var(--nuraly-menu-focus-color);
  }

  .menu-link.selected:not(.disabled):focus-visible {
    border-left: var(--nuraly-menu-selected-link-border) !important;
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
    --nuraly-color-icon: var(--nuraly-menu-link-icon-color);
    --nuraly-icon-size: var(--nuraly-menu-icon-size, 20px);
    flex-shrink: 0;
  }

  .menu-link nr-icon:first-child {
    padding-right: 0;
    padding-left: 0;
  }

  .menu-link:not(.disabled):not(.selected):hover nr-icon {
    --nuraly-color-icon: var(--nuraly-menu-hover-link-icon-color);
  }

  .menu-link.selected nr-icon {
    --nuraly-color-icon: var(--nuraly-menu-selected-link-icon-color);
  }

  /* Sub Menu Styles */
  .sub-menu {
    display: flex;
    flex-direction: column;
    padding-left: 0;
    list-style: none;
    color: var(--nuraly-sub-menu-color);
    margin-bottom: 4px;
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
    padding: var(--nuraly-sub-menu-header-padding, 1px);
    border-left: 4px solid transparent;
    border-top: 2px solid transparent;
    border-right: 2px solid transparent;
    border-bottom: 2px solid transparent;
    border-radius: var(--nuraly-menu-border-radius);
    gap: 8px;
  }

  .sub-menu .sub-menu-header span {
    flex: 1;
    min-width: 0;
    padding-left: 0;
  }

  .sub-menu .text-icon {
    flex-shrink: 0;
    --nuraly-color-icon: var(--nuraly-sub-menu-text-icon-color);
    --nuraly-icon-size: var(--nuraly-menu-icon-size, 20px);
  }

  .sub-menu .icons-container {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    flex-shrink: 0;
    /* Reserve space for dropdown to prevent layout shift */
    min-width: fit-content;
    /* Fixed height to prevent vertical shifting */
    height: 100%;
    min-height: 20px;
  }

  .menu-link .icon-container {
    display: flex;
    align-items: center;
    position: relative;
    flex-shrink: 0;
    /* Fixed height to prevent vertical shifting */
    height: 100%;
    min-height: 20px;
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
    --nuraly-color-icon: var(--nuraly-sub-menu-action-icon-color);
    --nuraly-icon-size: var(--nuraly-menu-icon-size, 16px);
  }

  .sub-menu .status-icon {
    --nuraly-color-icon: var(--nuraly-sub-menu-status-icon-color);
    --nuraly-icon-size: var(--nuraly-menu-icon-size, 16px);
  }

  .sub-menu .text-icon {
    --nuraly-color-icon: var(--nuraly-sub-menu-text-icon-color);
    --nuraly-icon-size: var(--nuraly-menu-icon-size, 20px);
  }

  .sub-menu #toggle-icon {
    --nuraly-color-icon: var(--nuraly-sub-menu-toggle-icon-color);
    --nuraly-icon-size: var(--nuraly-menu-icon-size, 16px);
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

  /* Focus-visible for keyboard navigation on submenus */
  .sub-menu:not(.disabled) .sub-menu-header:focus-visible {
    outline: none;
    border-top: var(--nuraly-sub-menu-focus-border);
    border-right: var(--nuraly-sub-menu-focus-border);
    border-bottom: var(--nuraly-sub-menu-focus-border);
  }

  .sub-menu:not(.disabled):not(.selected) .sub-menu-header:focus-visible {
    border-left: var(--nuraly-sub-menu-focus-border);
    color: var(--nuraly-sub-menu-focus-color);
  }

  .sub-menu.selected:not(.disabled) .sub-menu-header:focus-visible {
    border-left: var(--nuraly-menu-selected-link-border) !important;
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

  /* Arrow positioning for left arrow */
  .sub-menu.arrow-left .sub-menu-header {
    padding-left: var(--nuraly-sub-menu-arrow-left-padding, 8px); /* Add space for left arrow */
  }

  .sub-menu.arrow-left .sub-menu-header #toggle-icon {
    margin-right: 8px; /* Space between arrow and text */
    order: -1; /* Place arrow at the beginning */
  }

  /* Arrow positioning for right arrow (default) */
  .sub-menu.arrow-right .sub-menu-header #toggle-icon {
    margin-left: 8px; /* Space between text and arrow */
  }

  /* Ensure proper spacing in the header */
  .sub-menu.arrow-left .sub-menu-header span {
    padding-left: 0; /* Remove left padding when arrow is on the left */
  }

  /* Size Variants */
  .menu--small .menu-link {
    padding: var(--nuraly-menu-link-padding-small, 1px);
  }

  .menu--small .sub-menu .sub-menu-header {
    padding: var(--nuraly-sub-menu-header-padding-small, 1px);
  }

  .menu--medium .menu-link {
    padding: var(--nuraly-menu-link-padding-medium, 1px);
  }

  .menu--medium .sub-menu .sub-menu-header {
    padding: var(--nuraly-sub-menu-header-padding-medium, 1px);
  }

  .menu--large .menu-link {
    padding: var(--nuraly-menu-link-padding-large, 1px);
  }

  .menu--large .sub-menu .sub-menu-header {
    padding: var(--nuraly-sub-menu-header-padding-large, 1px);
  }
`;

export const styles = [menuStyle];
