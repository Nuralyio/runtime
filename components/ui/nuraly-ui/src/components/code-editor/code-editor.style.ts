/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    --nuraly-code-editor-width: 100%;
    --nuraly-code-editor-height: 100%;
    --nuraly-code-editor-min-height: 0;
    --nuraly-code-editor-max-height: none;
    --nuraly-code-editor-border-radius: 4px;
    --nuraly-code-editor-border: 1px solid var(--nuraly-border-color, #e0e0e0);

    display: block;
    width: var(--nuraly-code-editor-width);
    height: var(--nuraly-code-editor-height);
  }

  :host([hidden]) {
    display: none;
  }

  .editor-container {
    width: 100%;
    height: 100%;
    min-height: var(--nuraly-code-editor-min-height);
    max-height: var(--nuraly-code-editor-max-height);
    border-radius: var(--nuraly-code-editor-border-radius);
    overflow: hidden;
  }

  main {
    width: 100%;
    height: 100%;
  }
`;
