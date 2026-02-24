/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * DB Designer node fields - re-exports from modular structure
 *
 * The DB designer node fields have been split into smaller, focused modules:
 * - db-designer-fields/table-fields.ts - Table node configuration
 * - db-designer-fields/view-fields.ts - View node configuration
 * - db-designer-fields/index-fields.ts - Index node configuration
 * - db-designer-fields/relationship-fields.ts - Relationship node configuration
 * - db-designer-fields/constraint-fields.ts - Constraint node configuration
 * - db-designer-fields/query-fields.ts - Query node configuration
 */

export * from './db-designer-fields/index.js';
