/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }

  .form-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-form-gap, 16px);
  }

  .form-wrapper[disabled] {
    opacity: 0.6;
    pointer-events: none;
  }

  /* Form validation states */
  :host([data-validation-state="pristine"]) {
    border-left: 3px solid transparent;
  }

  :host([data-validation-state="valid"]) {
    border-left: 3px solid #52c41a;
  }

  :host([data-validation-state="invalid"]) {
    border-left: 3px solid #ff4d4f;
  }

  :host([data-validation-state="pending"]) {
    border-left: 3px solid #1890ff;
  }

  /* Form submission states */
  :host([data-submission-state="submitting"]) {
    opacity: 0.8;
    pointer-events: none;
  }

  :host([data-submission-state="success"]) {
    border-left: 3px solid #52c41a;
  }

  :host([data-submission-state="error"]) {
    border-left: 3px solid #ff4d4f;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .form-wrapper {
      gap: var(--nuraly-form-gap-mobile, 12px);
    }
  }
`;
