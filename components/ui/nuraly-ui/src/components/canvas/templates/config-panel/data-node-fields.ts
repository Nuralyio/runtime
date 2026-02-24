/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';
import type { DatabaseProvider } from '../../data-node/data-node.types.js';

// Import data node config component (includes field components)
import '../../data-node/data-node-config.component.js';

interface KvEntryLike {
  keyPath: string;
  value?: any;
  isSecret: boolean;
}

/**
 * Render Data Node specific configuration fields
 * Uses the nr-data-node-config component which handles real database introspection
 */
export function renderDataNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  kvEntries?: KvEntryLike[],
  onCreateKvEntry?: (detail: { keyPath: string; value: any; scope: string; isSecret: boolean }) => void,
  applicationId?: string,
  databaseProvider?: DatabaseProvider,
): TemplateResult {
  return html`
    <nr-data-node-config
      .config=${config}
      .kvEntries=${kvEntries || []}
      .onCreateKvEntry=${onCreateKvEntry}
      .applicationId=${applicationId || ''}
      .databaseProvider=${databaseProvider}
      @config-update=${(e: CustomEvent) => onUpdate(e.detail.key, e.detail.value)}
    ></nr-data-node-config>
  `;
}
