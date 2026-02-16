import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
} from '../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import { DbDesignerNodeType } from '../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';

export interface ColumnSnapshot {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

export interface TableSnapshot {
  name: string;
  columns: ColumnSnapshot[];
  primaryKey?: string;
}

export interface RelationshipSnapshot {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
}

export interface SchemaSnapshot {
  tables: Map<string, TableSnapshot>;
  relationships: Map<string, RelationshipSnapshot>;
}

export type SchemaChangeType =
  | 'CREATE_TABLE'
  | 'DROP_TABLE'
  | 'ADD_COLUMN'
  | 'DROP_COLUMN'
  | 'ALTER_COLUMN'
  | 'ADD_PRIMARY_KEY'
  | 'DROP_PRIMARY_KEY'
  | 'ADD_FOREIGN_KEY'
  | 'DROP_FOREIGN_KEY';

export interface SchemaChange {
  type: SchemaChangeType;
  table: string;
  column?: string;
  details?: Record<string, any>;
}

function parseEdgeLabel(label?: string): { sourceColumn: string; targetColumn: string } | null {
  if (!label) return null;
  // Format: "source_col → target_col"
  const parts = label.split('→').map(s => s.trim());
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { sourceColumn: parts[0], targetColumn: parts[1] };
  }
  return null;
}

function nodeIdToTableName(nodeId: string): string {
  return nodeId.startsWith('table-') ? nodeId.slice(6) : nodeId;
}

export function workflowToSnapshot(workflow: Workflow): SchemaSnapshot {
  const tables = new Map<string, TableSnapshot>();
  const relationships = new Map<string, RelationshipSnapshot>();

  for (const node of workflow.nodes) {
    if (node.type !== DbDesignerNodeType.TABLE) continue;

    const config = node.configuration;
    const tableName = (config.tableName as string) || node.name;
    const columns: ColumnSnapshot[] = ((config.columns as any[]) || []).map(col => ({
      name: col.name,
      type: col.type,
      nullable: col.nullable ?? true,
      defaultValue: col.defaultValue || undefined,
    }));

    tables.set(tableName, {
      name: tableName,
      columns,
      primaryKey: (config.primaryKey as string) || undefined,
    });
  }

  // Build a map of nodeId → tableName for TABLE nodes
  const nodeToTable = new Map<string, string>();
  for (const node of workflow.nodes) {
    if (node.type === DbDesignerNodeType.TABLE) {
      const tableName = (node.configuration.tableName as string) || node.name;
      nodeToTable.set(node.id, tableName);
    }
  }

  // Build edge lookup: targetNodeId+targetPortId → sourceNodeId
  const edgesByTarget = new Map<string, string>();
  for (const edge of workflow.edges) {
    edgesByTarget.set(`${edge.targetNodeId}:${edge.targetPortId}`, edge.sourceNodeId);
  }

  // Process DB_RELATIONSHIP nodes — connected via edges to their source/target ports
  for (const node of workflow.nodes) {
    if (node.type !== DbDesignerNodeType.RELATIONSHIP) continue;

    const config = node.configuration;
    const sourceColumn = config.sourceColumn as string;
    const targetColumn = config.targetColumn as string;
    if (!sourceColumn || !targetColumn) continue;

    const sourceNodeId = edgesByTarget.get(`${node.id}:source`);
    const targetNodeId = edgesByTarget.get(`${node.id}:target`);
    if (!sourceNodeId || !targetNodeId) continue;

    const sourceTable = nodeToTable.get(sourceNodeId);
    const targetTable = nodeToTable.get(targetNodeId);
    if (!sourceTable || !targetTable) continue;

    relationships.set(node.id, {
      id: node.id,
      sourceTable,
      sourceColumn,
      targetTable,
      targetColumn,
    });
  }

  // Also process direct table-to-table edges (from existing DB foreign keys)
  for (const edge of workflow.edges) {
    const sourceTable = nodeIdToTableName(edge.sourceNodeId);
    const targetTable = nodeIdToTableName(edge.targetNodeId);

    if (!tables.has(sourceTable) || !tables.has(targetTable)) continue;

    const parsed = parseEdgeLabel(edge.label);
    if (parsed) {
      relationships.set(edge.id, {
        id: edge.id,
        sourceTable,
        sourceColumn: parsed.sourceColumn,
        targetTable,
        targetColumn: parsed.targetColumn,
      });
    } else {
      // New edge drawn without a label — infer FK columns from table config
      const targetPk = tables.get(targetTable)!.primaryKey || 'id';
      const sourceColumn = `${targetTable}_${targetPk}`;
      relationships.set(edge.id, {
        id: edge.id,
        sourceTable,
        sourceColumn,
        targetTable,
        targetColumn: targetPk,
      });
    }
  }

  return { tables, relationships };
}

export function computeSchemaDiff(original: SchemaSnapshot, current: SchemaSnapshot): SchemaChange[] {
  const changes: SchemaChange[] = [];

  // 1. Tables in original but not current → DROP_TABLE
  for (const [name] of original.tables) {
    if (!current.tables.has(name)) {
      changes.push({ type: 'DROP_TABLE', table: name });
    }
  }

  // 2. Tables in current but not original → CREATE_TABLE
  for (const [name, table] of current.tables) {
    if (!original.tables.has(name)) {
      changes.push({
        type: 'CREATE_TABLE',
        table: name,
        details: {
          columns: table.columns,
          primaryKey: table.primaryKey,
        },
      });
    }
  }

  // 3. Shared tables: compare columns and primary keys
  for (const [name, currentTable] of current.tables) {
    const originalTable = original.tables.get(name);
    if (!originalTable) continue;

    const origCols = new Map(originalTable.columns.map(c => [c.name, c]));
    const currCols = new Map(currentTable.columns.map(c => [c.name, c]));

    // Dropped columns
    for (const [colName] of origCols) {
      if (!currCols.has(colName)) {
        changes.push({ type: 'DROP_COLUMN', table: name, column: colName });
      }
    }

    // Added columns
    for (const [colName, col] of currCols) {
      if (!origCols.has(colName)) {
        changes.push({
          type: 'ADD_COLUMN',
          table: name,
          column: colName,
          details: { type: col.type, nullable: col.nullable, defaultValue: col.defaultValue },
        });
      }
    }

    // Altered columns
    for (const [colName, currCol] of currCols) {
      const origCol = origCols.get(colName);
      if (!origCol) continue;

      if (origCol.type !== currCol.type ||
          origCol.nullable !== currCol.nullable ||
          (origCol.defaultValue || '') !== (currCol.defaultValue || '')) {
        changes.push({
          type: 'ALTER_COLUMN',
          table: name,
          column: colName,
          details: {
            oldType: origCol.type,
            newType: currCol.type,
            oldNullable: origCol.nullable,
            newNullable: currCol.nullable,
            oldDefault: origCol.defaultValue,
            newDefault: currCol.defaultValue,
          },
        });
      }
    }

    // Primary key changes
    if (originalTable.primaryKey !== currentTable.primaryKey) {
      if (originalTable.primaryKey) {
        changes.push({
          type: 'DROP_PRIMARY_KEY',
          table: name,
          details: { column: originalTable.primaryKey },
        });
      }
      if (currentTable.primaryKey) {
        changes.push({
          type: 'ADD_PRIMARY_KEY',
          table: name,
          details: { column: currentTable.primaryKey },
        });
      }
    }
  }

  // 4. Relationships: compare edges
  const origRelKeys = new Set<string>();
  for (const [, rel] of original.relationships) {
    origRelKeys.add(`${rel.sourceTable}.${rel.sourceColumn}->${rel.targetTable}.${rel.targetColumn}`);
  }

  const currRelKeys = new Set<string>();
  for (const [, rel] of current.relationships) {
    currRelKeys.add(`${rel.sourceTable}.${rel.sourceColumn}->${rel.targetTable}.${rel.targetColumn}`);
  }

  // Dropped foreign keys
  for (const [, rel] of original.relationships) {
    const key = `${rel.sourceTable}.${rel.sourceColumn}->${rel.targetTable}.${rel.targetColumn}`;
    if (!currRelKeys.has(key)) {
      changes.push({
        type: 'DROP_FOREIGN_KEY',
        table: rel.sourceTable,
        details: {
          sourceColumn: rel.sourceColumn,
          targetTable: rel.targetTable,
          targetColumn: rel.targetColumn,
        },
      });
    }
  }

  // Added foreign keys
  for (const [, rel] of current.relationships) {
    const key = `${rel.sourceTable}.${rel.sourceColumn}->${rel.targetTable}.${rel.targetColumn}`;
    if (!origRelKeys.has(key)) {
      changes.push({
        type: 'ADD_FOREIGN_KEY',
        table: rel.sourceTable,
        details: {
          sourceColumn: rel.sourceColumn,
          targetTable: rel.targetTable,
          targetColumn: rel.targetColumn,
        },
      });
    }
  }

  return changes;
}
