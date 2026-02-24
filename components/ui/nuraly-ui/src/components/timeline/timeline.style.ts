/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Timeline component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-timeline component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const styles = css`
  :host {
    display: block;
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-base, 14px);
    line-height: 1.5715;
    color: var(--nuraly-color-text);
    min-height: 0;
  }

  .timeline {
    margin: 0;
    padding: 8px 0 0 8px;
    list-style: none;
  }

  /* Timeline Item */
  .timeline-item {
    position: relative;
    padding-bottom: var(--nuraly-timeline-item-padding-bottom, 20px);
    list-style: none;
  }

  .timeline-item:last-child {
    padding-bottom: 0;
  }

  /* Timeline Tail (connecting line) */
  .timeline-item-tail {
    position: absolute;
    top: 10px;
    left: 4px;
    height: calc(100% - 10px);
    border-left: var(--nuraly-timeline-tail-width, 2px) solid var(--nuraly-timeline-tail-color, rgba(5, 5, 5, 0.06));
  }

  .timeline-item:last-child .timeline-item-tail {
    display: none;
  }

  .timeline-item.pending .timeline-item-tail {
    display: block;
  }

  /* Timeline Head (dot container) */
  .timeline-item-head {
    position: absolute;
    top: 5.5px;
    left: 0;
    width: 10px;
    height: 10px;
    background-color: var(--nuraly-timeline-dot-bg, #ffffff);
    border: var(--nuraly-timeline-dot-border-width, 2px) solid transparent;
    border-radius: 50%;
  }

  /* Timeline Head Colors */
  .timeline-item-head.blue {
    border-color: var(--nuraly-color-primary, #1890ff);
  }

  .timeline-item-head.red {
    border-color: var(--nuraly-color-error, #ff4d4f);
  }

  .timeline-item-head.green {
    border-color: var(--nuraly-color-success, #52c41a);
  }

  .timeline-item-head.gray {
    border-color: var(--nuraly-color-text-disabled, #d9d9d9);
  }

  /* Custom Head (with icon or custom content) */
  .timeline-item-head-custom {
    position: absolute;
    top: 5.5px;
    left: 0;
    width: auto;
    height: auto;
    margin-top: 0;
    padding: 3px 1px;
    line-height: 1;
    text-align: center;
    border: 0;
    border-radius: 0;
    transform: translate(-50%, -50%);
    top: 10px;
    left: 5px;
  }

  .timeline-item-head-custom nr-icon {
    font-size: 16px;
    vertical-align: middle;
  }

  /* Timeline Content */
  .timeline-item-content {
    position: relative;
    margin: 0 0 0 26px;
    word-break: break-word;
  }

  /* Timeline Label */
  .timeline-item-label {
    position: absolute;
    top: calc(-1 * var(--nuraly-font-size-base, 14px) * 1.5715 / 2);
    width: calc(50% - 12px);
    text-align: right;
    color: var(--nuraly-color-text-secondary, rgba(0, 0, 0, 0.45));
  }

  /* Pending Item */
  .timeline-item.pending .timeline-item-head {
    border-color: var(--nuraly-color-primary, #1890ff);
  }

  .timeline-item.pending .timeline-item-content {
    color: var(--nuraly-color-text-secondary, rgba(0, 0, 0, 0.45));
  }

  /* Right Mode */
  :host([mode="right"]) .timeline-item-tail {
    left: auto;
    right: 4px;
  }

  :host([mode="right"]) .timeline-item-head,
  :host([mode="right"]) .timeline-item-head-custom {
    left: auto;
    right: 0;
  }

  :host([mode="right"]) .timeline-item-head-custom {
    right: 5px;
  }

  :host([mode="right"]) .timeline-item-content {
    margin: 0 26px 0 0;
    text-align: right;
  }

  /* Alternate Mode */
  :host([mode="alternate"]) .timeline,
  :host([mode="alternate"]) .timeline-item {
    display: block;
  }

  :host([mode="alternate"]) .timeline-item-tail,
  :host([mode="alternate"]) .timeline-item-head,
  :host([mode="alternate"]) .timeline-item-head-custom {
    left: 50%;
    margin-left: -1px;
  }

  :host([mode="alternate"]) .timeline-item-head {
    margin-left: -5px;
  }

  :host([mode="alternate"]) .timeline-item-head-custom {
    margin-left: -5px;
  }

  :host([mode="alternate"]) .timeline-item-left .timeline-item-content {
    left: calc(50% - 4px);
    width: calc(50% - 14px);
    text-align: left;
  }

  :host([mode="alternate"]) .timeline-item-right .timeline-item-content {
    left: auto;
    right: calc(50% - 4px);
    width: calc(50% - 14px);
    text-align: right;
  }

  /* Alternate with Label */
  :host([mode="alternate"]) .timeline-item-left .timeline-item-label {
    left: calc(50% + 14px);
    width: calc(50% - 14px);
    text-align: left;
  }

  :host([mode="alternate"]) .timeline-item-right .timeline-item-label {
    right: calc(50% + 14px);
    width: calc(50% - 14px);
    text-align: right;
  }

  /* Reverse Mode */
  :host([reverse]) .timeline {
    display: flex;
    flex-direction: column-reverse;
  }

  /* RTL Support */
  :host([dir="rtl"]) .timeline-item-tail {
    left: auto;
    right: 4px;
  }

  :host([dir="rtl"]) .timeline-item-head,
  :host([dir="rtl"]) .timeline-item-head-custom {
    left: auto;
    right: 0;
  }

  :host([dir="rtl"]) .timeline-item-content {
    margin: 0 26px 0 0;
  }

  :host([dir="rtl"]) .timeline-item-label {
    text-align: left;
  }

  /* Dark theme support */
  :host([data-theme*="dark"]) .timeline-item-tail {
    border-color: var(--nuraly-timeline-tail-color, rgba(255, 255, 255, 0.12));
  }
`;
