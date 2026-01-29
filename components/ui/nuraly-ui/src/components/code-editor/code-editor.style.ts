/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    --nr-code-editor-width: 100%;
    --nr-code-editor-height: 100%;
    --nr-code-editor-min-height: 0;
    --nr-code-editor-max-height: none;
    --nr-code-editor-border-radius: 4px;
    --nr-code-editor-border: 1px solid var(--nr-border-color, #e0e0e0);

    display: block;
    width: var(--nr-code-editor-width);
    height: var(--nr-code-editor-height);
  }

  :host([hidden]) {
    display: none;
  }

  .editor-container {
    width: 100%;
    height: 100%;
    min-height: var(--nr-code-editor-min-height);
    max-height: var(--nr-code-editor-max-height);
    border-radius: var(--nr-code-editor-border-radius);
    overflow: hidden;
  }

  main {
    width: 100%;
    height: 100%;
  }
`;
