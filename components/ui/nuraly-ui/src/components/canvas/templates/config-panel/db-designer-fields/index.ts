/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * DB Designer node fields - re-exports from modular structure
 *
 * Split into separate files:
 * - table-fields.ts - Table node configuration
 * - view-fields.ts - View node configuration
 * - index-fields.ts - Index node configuration
 * - relationship-fields.ts - Relationship node configuration
 * - constraint-fields.ts - Constraint node configuration
 * - query-fields.ts - Query node configuration
 */

export { renderTableNodeFields } from './table-fields.js';
export { renderViewNodeFields } from './view-fields.js';
export { renderIndexNodeFields } from './index-fields.js';
export { renderRelationshipNodeFields } from './relationship-fields.js';
export { renderConstraintNodeFields } from './constraint-fields.js';
export { renderQueryNodeFields } from './query-fields.js';
