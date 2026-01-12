/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Data node operation types
 */
export enum DataOperation {
  QUERY = 'QUERY',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Filter operators for query conditions
 */
export enum FilterOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_OR_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'notIn',
  LIKE = 'like',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
}

/**
 * Filter operator metadata
 */
export interface FilterOperatorMeta {
  value: FilterOperator;
  label: string;
  types: ('string' | 'number' | 'boolean' | 'date' | 'any')[];
  requiresValue?: boolean;
}

/**
 * Available filter operators with metadata
 */
export const FILTER_OPERATORS: FilterOperatorMeta[] = [
  { value: FilterOperator.EQUALS, label: 'equals', types: ['string', 'number', 'boolean'] },
  { value: FilterOperator.NOT_EQUALS, label: 'not equals', types: ['string', 'number', 'boolean'] },
  { value: FilterOperator.GREATER_THAN, label: 'greater than', types: ['number', 'date'] },
  { value: FilterOperator.GREATER_OR_EQUAL, label: 'greater or equal', types: ['number', 'date'] },
  { value: FilterOperator.LESS_THAN, label: 'less than', types: ['number', 'date'] },
  { value: FilterOperator.LESS_OR_EQUAL, label: 'less or equal', types: ['number', 'date'] },
  { value: FilterOperator.IN, label: 'in list', types: ['string', 'number'] },
  { value: FilterOperator.NOT_IN, label: 'not in list', types: ['string', 'number'] },
  { value: FilterOperator.LIKE, label: 'contains', types: ['string'] },
  { value: FilterOperator.IS_NULL, label: 'is empty', types: ['any'], requiresValue: false },
  { value: FilterOperator.IS_NOT_NULL, label: 'is not empty', types: ['any'], requiresValue: false },
];

/**
 * Single filter condition
 */
export interface FilterCondition {
  field: string;
  op: FilterOperator;
  value?: unknown;
}

/**
 * Filter group with AND/OR logic
 */
export interface FilterGroup {
  and?: (FilterCondition | FilterGroup)[];
  or?: (FilterCondition | FilterGroup)[];
}

/**
 * Sort direction
 */
export type SortDirection = 'ASC' | 'DESC';

/**
 * Sort order specification
 */
export interface SortOrder {
  field: string;
  dir: SortDirection;
}

/**
 * Field mapping for INSERT/UPDATE operations
 */
export interface FieldMapping {
  [fieldName: string]: string | number | boolean | null;
}

/**
 * Data source definition
 */
export interface DataSource {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'mssql' | 'oracle' | 'rest';
  icon?: string;
  description?: string;
}

/**
 * Entity (table/collection) definition
 */
export interface DataEntity {
  id: string;
  name: string;
  schema?: string;
  type: 'table' | 'view' | 'collection';
  description?: string;
}

/**
 * Field (column) definition
 */
export interface DataField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'json' | 'array' | 'binary';
  nullable?: boolean;
  primaryKey?: boolean;
  description?: string;
}

/**
 * Data node configuration
 */
export interface DataNodeConfiguration {
  operation: DataOperation;
  dataSource: string | null;
  entity: string | null;
  filter: FilterGroup | null;
  fields: FieldMapping;
  select: string[];
  orderBy: SortOrder[];
  limit: number | null;
  offset: number | null;
  outputVariable: string;
}

/**
 * Default configuration for Data nodes
 */
export const DEFAULT_DATA_NODE_CONFIG: DataNodeConfiguration = {
  operation: DataOperation.QUERY,
  dataSource: null,
  entity: null,
  filter: null,
  fields: {},
  select: [],
  orderBy: [],
  limit: null,
  offset: null,
  outputVariable: 'results',
};

/**
 * Operation metadata for UI display
 */
export interface DataOperationMeta {
  value: DataOperation;
  label: string;
  icon: string;
  description: string;
}

/**
 * Available operations with metadata
 */
export const DATA_OPERATIONS: DataOperationMeta[] = [
  { value: DataOperation.QUERY, label: 'Query', icon: 'search', description: 'Fetch records' },
  { value: DataOperation.INSERT, label: 'Insert', icon: 'plus', description: 'Create record' },
  { value: DataOperation.UPDATE, label: 'Update', icon: 'edit', description: 'Modify records' },
  { value: DataOperation.DELETE, label: 'Delete', icon: 'trash', description: 'Remove records' },
];

/**
 * Configuration section definition
 */
export interface ConfigSection {
  id: string;
  title: string;
  description?: string;
  showWhen?: { operation: DataOperation[] };
  collapsed?: boolean;
}

/**
 * Data node configuration sections
 */
export const DATA_NODE_SECTIONS: ConfigSection[] = [
  { id: 'basic', title: 'Basic' },
  { id: 'filter', title: 'Filter', description: 'Define conditions to filter records', showWhen: { operation: [DataOperation.QUERY, DataOperation.UPDATE, DataOperation.DELETE] } },
  { id: 'fields', title: 'Fields', showWhen: { operation: [DataOperation.INSERT, DataOperation.UPDATE] } },
  { id: 'select', title: 'Select Fields', showWhen: { operation: [DataOperation.QUERY] } },
  { id: 'sorting', title: 'Sorting', showWhen: { operation: [DataOperation.QUERY] } },
  { id: 'pagination', title: 'Pagination', showWhen: { operation: [DataOperation.QUERY] } },
  { id: 'output', title: 'Output' },
];

/**
 * Check if a section should be shown based on operation
 */
export function shouldShowSection(section: ConfigSection, operation: DataOperation): boolean {
  if (!section.showWhen) return true;
  return section.showWhen.operation.includes(operation);
}

/**
 * Validate Data node configuration
 */
export interface ValidationError {
  field: string;
  message: string;
}

export function validateDataNodeConfig(config: DataNodeConfiguration): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!config.operation) {
    errors.push({ field: 'operation', message: 'Operation is required' });
  }

  if (!config.dataSource) {
    errors.push({ field: 'dataSource', message: 'Data source is required' });
  }

  if (!config.entity) {
    errors.push({ field: 'entity', message: 'Table/collection is required' });
  }

  if ((config.operation === DataOperation.INSERT || config.operation === DataOperation.UPDATE) &&
      Object.keys(config.fields).length === 0) {
    errors.push({ field: 'fields', message: 'At least one field is required' });
  }

  if (config.operation === DataOperation.DELETE && !config.filter) {
    errors.push({ field: 'filter', message: 'Filter is required for DELETE (safety)' });
  }

  return errors;
}

/**
 * Generate preview text for Data node
 */
export function generateDataNodePreview(config: DataNodeConfiguration): string {
  if (!config.operation || !config.entity) {
    return 'Configure data operation';
  }

  switch (config.operation) {
    case DataOperation.QUERY:
      return `Query from ${config.entity}`;
    case DataOperation.INSERT:
      return `Insert into ${config.entity}`;
    case DataOperation.UPDATE:
      return `Update ${config.entity}`;
    case DataOperation.DELETE:
      return `Delete from ${config.entity}`;
    default:
      return `${config.operation} ${config.entity}`;
  }
}
