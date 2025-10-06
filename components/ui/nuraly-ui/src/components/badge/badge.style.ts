/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Badge component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-badge component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const styles = css`
  :host {
    display: inline-block;
    position: relative;
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-badge-text-font-size, 12px);
    line-height: 1;
    vertical-align: middle;
  }

  /* Badge wrapper for positioning */
  .badge-wrapper {
    position: relative;
    display: inline-block;
  }

  /* Main badge indicator (count or dot) */
  .badge-indicator {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    transform-origin: 100% 0%;
    z-index: var(--nuraly-badge-indicator-z-index, auto);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--nuraly-badge-indicator-height, 20px);
    height: var(--nuraly-badge-indicator-height, 20px);
    padding: 0 6px;
    font-size: var(--nuraly-badge-text-font-size, 12px);
    font-weight: var(--nuraly-badge-text-font-weight, normal);
    line-height: var(--nuraly-badge-indicator-height, 20px);
    white-space: nowrap;
    text-align: center;
    background-color: var(--nuraly-color-error, #ff4d4f);
    color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 0 1px var(--nuraly-color-background, #fff);
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  /* Small size badge */
  .badge-indicator.small {
    min-width: var(--nuraly-badge-indicator-height-sm, 14px);
    height: var(--nuraly-badge-indicator-height-sm, 14px);
    padding: 0 4px;
    font-size: var(--nuraly-badge-text-font-size-sm, 12px);
    line-height: var(--nuraly-badge-indicator-height-sm, 14px);
    border-radius: 7px;
  }

  /* Dot badge (small indicator without count) */
  .badge-indicator.dot {
    min-width: var(--nuraly-badge-dot-size, 6px);
    width: var(--nuraly-badge-dot-size, 6px);
    height: var(--nuraly-badge-dot-size, 6px);
    padding: 0;
    border-radius: 50%;
  }

  /* Standalone badge (no children) */
  .badge-standalone {
    position: relative;
    display: inline-block;
    transform: none;
  }

  /* Status badge styles */
  .badge-status {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 0.5rem);
  }

  .badge-status-dot {
    width: var(--nuraly-badge-status-size, 6px);
    height: var(--nuraly-badge-status-size, 6px);
    border-radius: 50%;
    display: inline-block;
  }

  .badge-status-text {
    color: var(--nuraly-color-text);
    font-size: var(--nuraly-font-size-base, 14px);
  }

  /* Status colors */
  .badge-status-dot.success {
    background-color: var(--nuraly-color-success, #52c41a);
  }

  .badge-status-dot.processing {
    background-color: var(--nuraly-color-primary, #1890ff);
    position: relative;
  }

  .badge-status-dot.processing::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: 100%;
    height: 100%;
    border: 1px solid var(--nuraly-color-primary, #1890ff);
    border-radius: 50%;
    animation: badge-processing 1.2s infinite ease-in-out;
  }

  @keyframes badge-processing {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    100% {
      transform: scale(2.4);
      opacity: 0;
    }
  }

  .badge-status-dot.default {
    background-color: var(--nuraly-color-text-secondary, #8c8c8c);
  }

  .badge-status-dot.error {
    background-color: var(--nuraly-color-error, #ff4d4f);
  }

  .badge-status-dot.warning {
    background-color: var(--nuraly-color-warning, #faad14);
  }

  /* Color variants for badge indicator */
  .badge-indicator.pink { background-color: #eb2f96; }
  .badge-indicator.red { background-color: #f5222d; }
  .badge-indicator.yellow { background-color: #fadb14; color: rgba(0, 0, 0, 0.85); }
  .badge-indicator.orange { background-color: #fa8c16; }
  .badge-indicator.cyan { background-color: #13c2c2; }
  .badge-indicator.green { background-color: #52c41a; }
  .badge-indicator.blue { background-color: #1890ff; }
  .badge-indicator.purple { background-color: #722ed1; }
  .badge-indicator.geekblue { background-color: #2f54eb; }
  .badge-indicator.magenta { background-color: #eb2f96; }
  .badge-indicator.volcano { background-color: #fa541c; }
  .badge-indicator.gold { background-color: #faad14; color: rgba(0, 0, 0, 0.85); }
  .badge-indicator.lime { background-color: #a0d911; color: rgba(0, 0, 0, 0.85); }

  /* Ribbon badge styles */
  .badge-ribbon-wrapper {
    position: relative;
  }

  .badge-ribbon {
    position: absolute;
    top: var(--nuraly-spacing-2, 0.5rem);
    height: 22px;
    padding: 0 var(--nuraly-spacing-2, 0.5rem);
    color: #fff;
    line-height: 22px;
    white-space: nowrap;
    background-color: var(--nuraly-color-primary, #1890ff);
    border-radius: 2px;
  }

  .badge-ribbon.start {
    left: calc(-1 * var(--nuraly-spacing-1, 0.25rem));
    padding-left: var(--nuraly-spacing-2, 0.5rem);
  }

  .badge-ribbon.end {
    right: calc(-1 * var(--nuraly-spacing-1, 0.25rem));
    padding-right: var(--nuraly-spacing-2, 0.5rem);
  }

  .badge-ribbon::after {
    content: '';
    position: absolute;
    top: 100%;
    width: 0;
    height: 0;
    border: 4px solid transparent;
  }

  .badge-ribbon.start::after {
    left: 0;
    border-top-color: currentColor;
    border-left-color: currentColor;
    filter: brightness(0.7);
  }

  .badge-ribbon.end::after {
    right: 0;
    border-top-color: currentColor;
    border-right-color: currentColor;
    filter: brightness(0.7);
  }

  /* Ribbon color variants */
  .badge-ribbon.pink { background-color: #eb2f96; color: #fff; }
  .badge-ribbon.red { background-color: #f5222d; color: #fff; }
  .badge-ribbon.yellow { background-color: #fadb14; color: rgba(0, 0, 0, 0.85); }
  .badge-ribbon.orange { background-color: #fa8c16; color: #fff; }
  .badge-ribbon.cyan { background-color: #13c2c2; color: #fff; }
  .badge-ribbon.green { background-color: #52c41a; color: #fff; }
  .badge-ribbon.blue { background-color: #1890ff; color: #fff; }
  .badge-ribbon.purple { background-color: #722ed1; color: #fff; }
  .badge-ribbon.geekblue { background-color: #2f54eb; color: #fff; }
  .badge-ribbon.magenta { background-color: #eb2f96; color: #fff; }
  .badge-ribbon.volcano { background-color: #fa541c; color: #fff; }
  .badge-ribbon.gold { background-color: #faad14; color: rgba(0, 0, 0, 0.85); }
  .badge-ribbon.lime { background-color: #a0d911; color: rgba(0, 0, 0, 0.85); }

  /* Hidden state */
  .badge-hidden {
    display: none;
  }

  /* RTL Support */
  :host([dir="rtl"]) .badge-indicator {
    right: auto;
    left: 0;
    transform: translate(-50%, -50%);
    transform-origin: 0% 0%;
  }

  :host([dir="rtl"]) .badge-ribbon.start {
    left: auto;
    right: calc(-1 * var(--nuraly-spacing-1, 0.25rem));
  }

  :host([dir="rtl"]) .badge-ribbon.end {
    right: auto;
    left: calc(-1 * var(--nuraly-spacing-1, 0.25rem));
  }
`;
