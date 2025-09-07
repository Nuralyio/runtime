/**
 * Database Type Definitions for Monaco Editor IntelliSense
 * 
 * This file contains all TypeScript type definitions for the Database class
 * and related interfaces used in the Monaco code editor for IntelliSense support.
 */

export const databaseTypeDefinitions = `
/**
 * Database configuration options
 */
interface DatabaseOptions {
    timeout?: number;
    headers?: Record<string, string>;
    [key: string]: any;
}

/**
 * Table schema definition for creating tables
 */
interface TableSchema {
    [key: string]: {
        type: string;
        nullable?: boolean;
        default?: any;
        [key: string]: any;
    };
}

/**
 * Options for select queries including relations and criteria
 */
interface SelectOptions {
    relations?: RelationDefinition[];
    criteria?: Record<string, any>;
    fields?: string[];
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    [key: string]: any;
}

/**
 * Relation definition for joins
 */
interface RelationDefinition {
    table: string;
    localField: string;
    foreignField: string;
    type: 'inner' | 'left' | 'right' | 'outer';
}

/**
 * Join definition for complex queries
 */
interface JoinDefinition {
    table: string;
    on: string;
    type?: string;
}

/**
 * Batch operation definition
 */
interface BatchOperation {
    method: string;
    table: string;
    data?: Record<string, any>;
    criteria?: Record<string, any>;
    options?: SelectOptions;
}

/**
 * Pagination result with metadata
 */
interface PaginationResult<T> {
    data: T[];
    count: number;
    pagination: {
        currentPage: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

/**
 * Backup data structure
 */
interface BackupData {
    tableName: string;
    timestamp: string;
    recordCount: number;
    data: Record<string, any>[];
}

/**
 * Static Database Client for Nuraly Database Manager
 * 
 * A comprehensive JavaScript class that provides a clean static interface for all database operations
 * including table management, data operations, joins, and advanced queries.
 */
declare class Database {
    /**
     * Configure the Database client
     * @param baseUrl The base URL of the database API (default: /api/v1/database)
     * @param options Additional configuration options
     */
    static configure(baseUrl?: string, options?: DatabaseOptions): void;

    // HEALTH & INFO METHODS
    /**
     * Check the health status of the database service
     * @returns Health status
     */
    static health(): Promise<any>;

    /**
     * Get database connection information and metadata
     * @returns Database info
     */
    static getInfo(): Promise<any>;

    // TABLE MANAGEMENT METHODS
    /**
     * Create a new table with specified schema
     * @param tableName Name of the table to create
     * @param schema Table schema definition
     * @param options Additional options
     * @returns Creation result
     */
    static createTable(tableName: string, schema: TableSchema, options?: Record<string, any>): Promise<any>;

    /**
     * Update existing table schema (add columns)
     * @param tableName Name of the table to update
     * @param schema New columns to add
     * @returns Update result
     */
    static updateSchema(tableName: string, schema: TableSchema): Promise<any>;

    /**
     * Drop a table
     * @param tableName Name of the table to drop
     * @returns Drop result
     */
    static dropTable(tableName: string): Promise<any>;

    /**
     * List all tables in the database
     * @returns List of tables
     */
    static listTables(): Promise<any>;

    /**
     * Get table schema information
     * @param tableName Name of the table
     * @returns Table schema
     */
    static getTableSchema(tableName: string): Promise<any>;

    /**
     * Execute comprehensive schema queries for database introspection
     * @param type Type of schema query (LIST_TABLES, DESCRIBE_TABLE, TABLE_EXISTS, GET_INFO, LIST_INDEXES, GET_CONSTRAINTS, GET_FOREIGN_KEYS)
     * @param tableName Name of the table (optional, required for table-specific queries)
     * @returns Schema query result
     */
    static schemaQuery(type: string, tableName?: string): Promise<any>;

    /**
     * Check if a table exists in the database
     * @param tableName Name of the table to check
     * @returns True if table exists, false otherwise
     */
    static tableExists(tableName: string): Promise<boolean>;

    /**
     * Get all column information for a specific table
     * @param tableName Name of the table
     * @returns Column information including types, constraints, and defaults
     */
    static columns(tableName: string): Promise<any>;

    /**
     * Get database information and metadata
     * @returns Database information and metadata
     */
    static getDatabaseInfo(): Promise<any>;

    /**
     * Get table constraints (primary keys, foreign keys, unique constraints, etc.)
     * @param tableName Name of the table
     * @returns Table constraints information
     */
    static getConstraints(tableName: string): Promise<any>;

    /**
     * Get foreign key relationships for a table
     * @param tableName Name of the table
     * @returns Foreign key information and relationships
     */
    static getForeignKeys(tableName: string): Promise<any>;

    // DATA OPERATION METHODS
    /**
     * Insert data into a table
     * @param tableName Name of the table
     * @param data Data to insert
     * @returns Insert result
     */
    static insert(tableName: string, data: Record<string, any>): Promise<any>;

    /**
     * Bulk insert multiple records
     * @param tableName Name of the table
     * @param records Array of records to insert
     * @returns Array of insert results
     */
    static bulkInsert(tableName: string, records: Record<string, any>[]): Promise<any[]>;

    /**
     * Unified select method that handles both regular queries and queries with relations (joins)
     * @param tableName Name of the table
     * @param options Query options
     * @returns Select result
     */
    static select(tableName: string, options?: SelectOptions): Promise<any>;

    /**
     * Update data in a table
     * @param tableName Name of the table
     * @param data Data to update
     * @param criteria Update criteria
     * @returns Update result
     */
    static update(tableName: string, data: Record<string, any>, criteria: Record<string, any>): Promise<any>;

    /**
     * Delete data from a table
     * @param tableName Name of the table
     * @param criteria Delete criteria
     * @returns Delete result
     */
    static delete(tableName: string, criteria: Record<string, any>): Promise<any>;

    // AGGREGATION & ANALYSIS METHODS
    /**
     * Count records in a table
     * @param tableName Name of the table
     * @param criteria Count criteria (optional)
     * @returns Count result
     */
    static count(tableName: string, criteria?: Record<string, any>): Promise<any>;

    /**
     * Calculate sum of a field
     * @param tableName Name of the table
     * @param field Field to sum
     * @param criteria Filter criteria (optional)
     * @returns Sum result
     */
    static sum(tableName: string, field: string, criteria?: Record<string, any>): Promise<any>;

    /**
     * Calculate average of a field
     * @param tableName Name of the table
     * @param field Field to average
     * @param criteria Filter criteria (optional)
     * @returns Average result
     */
    static avg(tableName: string, field: string, criteria?: Record<string, any>): Promise<any>;

    /**
     * Find maximum value of a field
     * @param tableName Name of the table
     * @param field Field to find max
     * @param criteria Filter criteria (optional)
     * @returns Max result
     */
    static max(tableName: string, field: string, criteria?: Record<string, any>): Promise<any>;

    /**
     * Find minimum value of a field
     * @param tableName Name of the table
     * @param field Field to find min
     * @param criteria Filter criteria (optional)
     * @returns Min result
     */
    static min(tableName: string, field: string, criteria?: Record<string, any>): Promise<any>;

    /**
     * Group by field with aggregation
     * @param tableName Name of the table
     * @param groupField Field to group by
     * @param aggregateFields Fields to aggregate
     * @param aggregateOperations Aggregation operations
     * @param criteria Filter criteria (optional)
     * @returns Group by result
     */
    static groupBy(tableName: string, groupField: string, aggregateFields: string[], aggregateOperations: string[], criteria?: Record<string, any>): Promise<any>;

    // INDEX MANAGEMENT METHODS
    /**
     * Create an index on table fields
     * @param tableName Name of the table
     * @param indexName Name of the index
     * @param fields Fields to index
     * @param indexType Type of index (btree, hash, etc.)
     * @returns Index creation result
     */
    static createIndex(tableName: string, indexName: string, fields: string[], indexType?: string): Promise<any>;

    /**
     * Drop an index
     * @param tableName Name of the table
     * @param indexName Name of the index to drop
     * @returns Index drop result
     */
    static dropIndex(tableName: string, indexName: string): Promise<any>;

    /**
     * List all indexes for a table
     * @param tableName Name of the table
     * @returns List of indexes
     */
    static listIndexes(tableName: string): Promise<any>;

    // ADVANCED QUERY METHODS
    /**
     * Execute raw SQL query
     * @param sql SQL query to execute
     * @param parameters Query parameters (optional)
     * @returns Query result
     */
    static executeSQL(sql: string, parameters?: any[]): Promise<any>;

    /**
     * Perform a complex join query
     * @param mainTable Main table for the join
     * @param joins Array of join specifications
     * @param options Additional query options
     * @returns Join result
     */
    static join(mainTable: string, joins: JoinDefinition[], options?: Record<string, any>): Promise<any>;

    // BATCH OPERATION METHODS
    /**
     * Execute multiple operations in sequence
     * @param operations Array of operations to execute
     * @returns Array of results
     */
    static batch(operations: BatchOperation[]): Promise<any[]>;

    // UTILITY METHODS
    /**
     * Get paginated results
     * @param tableName Name of the table
     * @param page Page number (1-based)
     * @param pageSize Number of records per page
     * @param options Additional query options
     * @returns Paginated results with metadata
     */
    static paginate(tableName: string, page?: number, pageSize?: number, options?: SelectOptions): Promise<PaginationResult<any>>;

    /**
     * Search records with text matching
     * @param tableName Name of the table
     * @param searchTerm Term to search for
     * @param searchFields Fields to search in
     * @param options Additional options
     * @returns Search results
     */
    static search(tableName: string, searchTerm: string, searchFields: string[], options?: SelectOptions): Promise<any>;

    /**
     * Backup table data to JSON
     * @param tableName Name of the table to backup
     * @returns Backup data
     */
    static backup(tableName: string): Promise<BackupData>;

    /**
     * Restore table data from backup
     * @param backupData Backup data object
     * @param clearFirst Whether to clear existing data first
     * @returns Restore result
     */
    static restore(backupData: BackupData, clearFirst?: boolean): Promise<any>;
}

declare const Database: typeof Database;
`;
