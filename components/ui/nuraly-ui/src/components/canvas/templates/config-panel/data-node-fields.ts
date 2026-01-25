/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';

// Import data node config component (includes field components)
import '../../data-node/data-node-config.component.js';

/**
 * Render Data Node specific configuration fields
 * Uses the nr-data-node-config component which handles real database introspection
 */
export function renderDataNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <nr-data-node-config
      .config=${config}
      @config-update=${(e: CustomEvent) => onUpdate(e.detail.key, e.detail.value)}
    ></nr-data-node-config>
  `;
}
