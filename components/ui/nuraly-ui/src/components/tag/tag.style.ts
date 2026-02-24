/**
 * @license
 * Copyright 2025 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host { display: inline-block; }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-tag-gap, 6px);
    height: var(--nuraly-tag-height, auto);
    padding: var(--nuraly-tag-padding-y, 0px) var(--nuraly-tag-padding-x, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-tag-font-size, var(--nuraly-font-size-sm));
    line-height: 1;
    color: var(--nuraly-tag-color, var(--nuraly-color-text));
    background-color: var(--nuraly-tag-bg, var(--nuraly-color-background));
    border: 1px solid var(--nuraly-tag-border-color, var(--nuraly-color-border));
    border-radius: var(--nuraly-tag-radius, var(--nuraly-border-radius-sm));
    transition: all var(--nuraly-transition-fast) ease;
    user-select: none;
  }

  .tag--borderless { border-color: transparent; }

  .tag--small {
    padding: var(--nuraly-tag-padding-y-sm, 0px) var(--nuraly-tag-padding-x-sm, 6px);
    font-size: var(--nuraly-tag-font-size-sm, var(--nuraly-font-size-xs));
  }

  /* Checkable behavior */
  .tag--checkable { cursor: pointer; }
  .tag--checkable:not(.tag--disabled):hover {
    background-color: var(--nuraly-tag-checkable-hover-bg, var(--nuraly-color-background-hover));
  }
  .tag--checkable.tag--checked {
    background-color: var(--nuraly-tag-checked-bg, var(--nuraly-color-primary-light));
    color: var(--nuraly-tag-checked-color, var(--nuraly-color-primary-dark));
    border-color: var(--nuraly-tag-checked-border-color, var(--nuraly-color-border-brand));
  }

  .tag--disabled { opacity: 0.6; cursor: not-allowed; }

  .tag__icon { display: inline-flex; align-items: center; }
  .tag__content { display: inline-flex; align-items: center; }

  .tag__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    line-height: 1;
    padding: 0;
    border: none;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    border-radius: var(--nuraly-border-radius-xs);
    transition: background-color var(--nuraly-transition-fast) ease, opacity var(--nuraly-transition-fast) ease;
  }
  .tag__close:hover { background-color: var(--nuraly-color-background-hover); }
  .tag__close:disabled { cursor: not-allowed; opacity: 0.6; }

  /* Closing animation (height/opacity collapse) */
  @keyframes tagFadeOut { from { opacity: 1; } to { opacity: 0; } }
  .tag--closing { animation: tagFadeOut 0.2s ease forwards; }

  /* Preset solid color tags similar to AntD */
  .tag--magenta { background-color: #f759ab; border-color: #f759ab; color: #fff; }
  .tag--red { background-color: #ff4d4f; border-color: #ff4d4f; color: #fff; }
  .tag--volcano { background-color: #fa541c; border-color: #fa541c; color: #fff; }
  .tag--orange { background-color: #fa8c16; border-color: #fa8c16; color: #fff; }
  .tag--gold { background-color: #faad14; border-color: #faad14; color: rgba(0,0,0,0.88); }
  .tag--lime { background-color: #a0d911; border-color: #a0d911; color: rgba(0,0,0,0.88); }
  .tag--green { background-color: #52c41a; border-color: #52c41a; color: #fff; }
  .tag--cyan { background-color: #13c2c2; border-color: #13c2c2; color: #fff; }
  .tag--blue { background-color: #1677ff; border-color: #1677ff; color: #fff; }
  .tag--geekblue { background-color: #2f54eb; border-color: #2f54eb; color: #fff; }
  .tag--purple { background-color: #722ed1; border-color: #722ed1; color: #fff; }

  /* Custom color tag hue via inline CSS variable */
  .tag--custom { background-color: var(--nr-tag-custom-bg); border-color: var(--nr-tag-custom-bg); color: var(--nuraly-color-text-on-color, #fff); }
`;
