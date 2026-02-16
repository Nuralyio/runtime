import type { SchemaChange, ColumnSnapshot } from './schema-diff';

export type DbType = 'postgresql' | 'mysql' | string;

function isMySQL(dbType: DbType): boolean {
  return dbType === 'mysql';
}

function q(identifier: string, dbType: DbType): string {
  if (isMySQL(dbType)) {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }
  return `"${identifier.replace(/"/g, '""')}"`;
}

function tableRef(schema: string | undefined, table: string, dbType: DbType): string {
  return schema ? `${q(schema, dbType)}.${q(table, dbType)}` : q(table, dbType);
}

function columnDef(col: ColumnSnapshot, isPrimaryKey: boolean, dbType: DbType): string {
  let def = `${q(col.name, dbType)} ${col.type}`;
  if (isPrimaryKey) {
    def += ' PRIMARY KEY';
  }
  if (!col.nullable && !isPrimaryKey) {
    def += ' NOT NULL';
  }
  if (col.defaultValue) {
    def += ` DEFAULT ${col.defaultValue}`;
  }
  return def;
}

export function generateDdl(changes: SchemaChange[], schema?: string, dbType: DbType = 'postgresql'): string[] {
  const statements: string[] = [];
  const mysql = isMySQL(dbType);

  for (const change of changes) {
    switch (change.type) {
      case 'CREATE_TABLE': {
        const columns: ColumnSnapshot[] = change.details?.columns || [];
        const pk = change.details?.primaryKey;
        const colDefs = columns.map(col => columnDef(col, col.name === pk, dbType));
        const ref = tableRef(schema, change.table, dbType);
        statements.push(`CREATE TABLE ${ref} (\n  ${colDefs.join(',\n  ')}\n)`);
        break;
      }

      case 'DROP_TABLE': {
        const ref = tableRef(schema, change.table, dbType);
        statements.push(mysql ? `DROP TABLE ${ref}` : `DROP TABLE ${ref} CASCADE`);
        break;
      }

      case 'ADD_COLUMN': {
        const ref = tableRef(schema, change.table, dbType);
        let def = `ALTER TABLE ${ref} ADD COLUMN ${q(change.column!, dbType)} ${change.details?.type || 'text'}`;
        if (change.details?.nullable === false) {
          def += ' NOT NULL';
        }
        if (change.details?.defaultValue) {
          def += ` DEFAULT ${change.details.defaultValue}`;
        }
        statements.push(def);
        break;
      }

      case 'DROP_COLUMN': {
        statements.push(
          `ALTER TABLE ${tableRef(schema, change.table, dbType)} DROP COLUMN ${q(change.column!, dbType)}`
        );
        break;
      }

      case 'ALTER_COLUMN': {
        const ref = tableRef(schema, change.table, dbType);
        const col = q(change.column!, dbType);
        const d = change.details || {};

        if (mysql) {
          // MySQL uses MODIFY COLUMN for type/nullable changes
          if (d.oldType !== d.newType || d.oldNullable !== d.newNullable) {
            let modDef = `ALTER TABLE ${ref} MODIFY COLUMN ${col} ${d.newType}`;
            if (!d.newNullable) {
              modDef += ' NOT NULL';
            }
            if (d.newDefault) {
              modDef += ` DEFAULT ${d.newDefault}`;
            }
            statements.push(modDef);
          } else if ((d.oldDefault || '') !== (d.newDefault || '')) {
            if (d.newDefault) {
              statements.push(`ALTER TABLE ${ref} ALTER COLUMN ${col} SET DEFAULT ${d.newDefault}`);
            } else {
              statements.push(`ALTER TABLE ${ref} ALTER COLUMN ${col} DROP DEFAULT`);
            }
          }
        } else {
          // PostgreSQL uses separate ALTER COLUMN statements
          if (d.oldType !== d.newType) {
            statements.push(`ALTER TABLE ${ref} ALTER COLUMN ${col} TYPE ${d.newType}`);
          }
          if (d.oldNullable !== d.newNullable) {
            statements.push(
              `ALTER TABLE ${ref} ALTER COLUMN ${col} ${d.newNullable ? 'DROP NOT NULL' : 'SET NOT NULL'}`
            );
          }
          if ((d.oldDefault || '') !== (d.newDefault || '')) {
            if (d.newDefault) {
              statements.push(`ALTER TABLE ${ref} ALTER COLUMN ${col} SET DEFAULT ${d.newDefault}`);
            } else {
              statements.push(`ALTER TABLE ${ref} ALTER COLUMN ${col} DROP DEFAULT`);
            }
          }
        }
        break;
      }

      case 'ADD_PRIMARY_KEY': {
        const ref = tableRef(schema, change.table, dbType);
        const pkCol = q(change.details?.column, dbType);
        statements.push(`ALTER TABLE ${ref} ADD PRIMARY KEY (${pkCol})`);
        break;
      }

      case 'DROP_PRIMARY_KEY': {
        const ref = tableRef(schema, change.table, dbType);
        if (mysql) {
          statements.push(`ALTER TABLE ${ref} DROP PRIMARY KEY`);
        } else {
          const constraintName = `${change.table}_pkey`;
          statements.push(`ALTER TABLE ${ref} DROP CONSTRAINT IF EXISTS ${q(constraintName, dbType)}`);
        }
        break;
      }

      case 'ADD_FOREIGN_KEY': {
        const ref = tableRef(schema, change.table, dbType);
        const d = change.details!;
        const constraintName = `fk_${change.table}_${d.sourceColumn}_${d.targetTable}_${d.targetColumn}`;
        const targetRef = tableRef(schema, d.targetTable, dbType);
        // MySQL requires an index on the referenced column
        if (mysql) {
          const idxName = `idx_${d.targetTable}_${d.targetColumn}`;
          statements.push(
            `CREATE INDEX ${q(idxName, dbType)} ON ${targetRef} (${q(d.targetColumn, dbType)})`
          );
        }
        statements.push(
          `ALTER TABLE ${ref} ADD CONSTRAINT ${q(constraintName, dbType)} FOREIGN KEY (${q(d.sourceColumn, dbType)}) REFERENCES ${targetRef} (${q(d.targetColumn, dbType)})`
        );
        break;
      }

      case 'DROP_FOREIGN_KEY': {
        const ref = tableRef(schema, change.table, dbType);
        const d = change.details!;
        if (mysql) {
          const constraintName = `fk_${change.table}_${d.sourceColumn}_${d.targetTable}_${d.targetColumn}`;
          statements.push(`ALTER TABLE ${ref} DROP FOREIGN KEY ${q(constraintName, dbType)}`);
        } else {
          const constraintName = `fk_${change.table}_${d.sourceColumn}_${d.targetTable}_${d.targetColumn}`;
          statements.push(`ALTER TABLE ${ref} DROP CONSTRAINT IF EXISTS ${q(constraintName, dbType)}`);
        }
        break;
      }
    }
  }

  return statements;
}

export function formatDdlScript(statements: string[]): string {
  return statements.map(s => s + ';').join('\n\n');
}
