/**
 * Static Database Client for Nuraly Database Manager
 * 
 * A comprehensive JavaScript class that provides a clean static interface for all database operations
 * including table management, data operations, joins, and advanced queries.
 * 
 * @author Nuraly Team
 * @version 1.0.0
 */

// Type definitions for DatabaseClient
interface DatabaseOptions {
    timeout?: number;
    headers?: Record<string, string>;
    [key: string]: any;
}

interface RequestConfig {
    method: string;
    headers: Record<string, string>;
    signal: AbortSignal;
    body?: string;
}

interface TableSchema {
    [key: string]: {
        type: string;
        nullable?: boolean;
        default?: any;
        [key: string]: any;
    };
}

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

interface RelationDefinition {
    table: string;
    localField: string;
    foreignField: string;
    type: 'inner' | 'left' | 'right' | 'outer';
}

interface JoinDefinition {
    table: string;
    on: string;
    type?: string;
}

interface BatchOperation {
    method: string;
    table: string;
    data?: Record<string, any>;
    criteria?: Record<string, any>;
    options?: SelectOptions;
}

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

interface BackupData {
    tableName: string;
    timestamp: string;
    recordCount: number;
    data: Record<string, any>[];
}

class Database {
    private static baseUrl: string = '/api/v1/database';
    private static options: DatabaseOptions = {
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    /**
     * Configure the Database client
     * @param {string} baseUrl - The base URL of the database API (default: /api/v1/database)
     * @param {DatabaseOptions} options - Additional configuration options
     */
    static configure(baseUrl = '/api/v1/database', options: DatabaseOptions = {}) {
        Database.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        Database.options = {
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
    }

    /**
     * Makes an HTTP request to the API
     * @param {string} endpoint - The API endpoint
     * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {Record<string, any> | null} data - Request body data
     * @returns {Promise<any>} The API response
     */
    private static async request(endpoint: string, method = 'GET', data: Record<string, any> | null = null): Promise<any> {
        const url = `${Database.baseUrl}${endpoint}`;
        const config: RequestConfig = {
            method,
            headers: Database.options.headers,
            signal: AbortSignal.timeout(Database.options.timeout)
        };

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return result;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // ============================================================================
    // HEALTH & INFO METHODS
    // ============================================================================

    /**
     * Check the health status of the database service
     * @returns {Promise<any>} Health status
     */
    static async health(): Promise<any> {
        return Database.request('/health', 'GET');
    }

    /**
     * Get database connection information and metadata
     * @returns {Promise<any>} Database info
     */
    static async getInfo(): Promise<any> {
        return Database.request('/execute', 'POST', { operation: 'GET_INFO' });
    }

    // ============================================================================
    // TABLE MANAGEMENT METHODS
    // ============================================================================

    /**
     * Create a new table with specified schema
     * @param {string} tableName - Name of the table to create
     * @param {TableSchema} schema - Table schema definition
     * @param {Record<string, any>} options - Additional options
     * @returns {Promise<any>} Creation result
     */
    static async createTable(tableName: string, schema: TableSchema, options: Record<string, any> = {}): Promise<any> {
        const payload = {
            operation: 'CREATE_TABLE',
            tableName,
            schema,
            ...options
        };
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Update existing table schema (add columns)
     * @param {string} tableName - Name of the table to update
     * @param {TableSchema} schema - New columns to add
     * @returns {Promise<any>} Update result
     */
    static async updateSchema(tableName: string, schema: TableSchema): Promise<any> {
        const payload = {
            operation: 'UPDATE_SCHEMA',
            tableName,
            schema
        };
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Drop a table
     * @param {string} tableName - Name of the table to drop
     * @returns {Promise<any>} Drop result
     */
    static async dropTable(tableName: string): Promise<any> {
        return Database.request(`/table/${tableName}`, 'DELETE');
    }

    /**
     * List all tables in the database
     * @returns {Promise<any>} List of tables
     */
    static async listTables(): Promise<any> {
        return Database.request('/execute', 'POST', { operation: 'LIST_TABLES' });
    }

    /**
     * Get table schema information
     * @param {string} tableName - Name of the table
     * @returns {Promise<any>} Table schema
     */
    static async getTableSchema(tableName: string): Promise<any> {
        return Database.request('/execute', 'POST', { 
            operation: 'DESCRIBE_TABLE', 
            tableName 
        });
    }

    // ============================================================================
    // DATA OPERATION METHODS
    // ============================================================================

    /**
     * Insert data into a table
     * @param {string} tableName - Name of the table
     * @param {Record<string, any>} data - Data to insert
     * @returns {Promise<any>} Insert result
     */
    static async insert(tableName: string, data: Record<string, any>): Promise<any> {
        return Database.request(`/table/${tableName}/insert`, 'POST', data);
    }

    /**
     * Bulk insert multiple records
     * @param {string} tableName - Name of the table
     * @param {Array<Record<string, any>>} records - Array of records to insert
     * @returns {Promise<Array<any>>} Array of insert results
     */
    static async bulkInsert(tableName: string, records: Record<string, any>[]): Promise<any[]> {
        const results = [];
        for (const record of records) {
            const result = await Database.insert(tableName, record);
            results.push(result);
        }
        return results;
    }

    /**
     * Unified select method that handles both regular queries and queries with relations (joins)
     * @param {string} tableName - Name of the table
     * @param {SelectOptions} options - Query options
     * @returns {Promise<any>} Select result
     */
    static async select(tableName: string, options: SelectOptions = {}): Promise<any> {
        return await Database.request(`/table/${tableName}/select`, 'POST', options);
    }

    /**
     * Update data in a table
     * @param {string} tableName - Name of the table
     * @param {Record<string, any>} data - Data to update
     * @param {Record<string, any>} criteria - Update criteria
     * @returns {Promise<any>} Update result
     */
    static async update(tableName: string, data: Record<string, any>, criteria: Record<string, any>): Promise<any> {
        const payload = { data, criteria };
        return Database.request(`/table/${tableName}/update`, 'PUT', payload);
    }

    /**
     * Delete data from a table
     * @param {string} tableName - Name of the table
     * @param {Record<string, any>} criteria - Delete criteria
     * @returns {Promise<any>} Delete result
     */
    static async delete(tableName: string, criteria: Record<string, any>): Promise<any> {
        const payload = { criteria };
        return Database.request(`/table/${tableName}/delete`, 'DELETE', payload);
    }
    
    // ============================================================================
    // AGGREGATION & ANALYSIS METHODS
    // ============================================================================

    /**
     * Count records in a table
     * @param {string} tableName - Name of the table
     * @param {Record<string, any>} criteria - Count criteria (optional)
     * @returns {Promise<any>} Count result
     */
    static async count(tableName: string, criteria: Record<string, any> = {}): Promise<any> {
        const payload: Record<string, any> = { operation: 'COUNT', tableName };
        if (Object.keys(criteria).length > 0) {
            payload.criteria = criteria;
        }
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Calculate sum of a field
     * @param {string} tableName - Name of the table
     * @param {string} field - Field to sum
     * @param {Record<string, any>} criteria - Filter criteria (optional)
     * @returns {Promise<any>} Sum result
     */
    static async sum(tableName: string, field: string, criteria: Record<string, any> = {}): Promise<any> {
        const payload: Record<string, any> = { operation: 'SUM', tableName, field };
        if (Object.keys(criteria).length > 0) {
            payload.criteria = criteria;
        }
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Calculate average of a field
     * @param {string} tableName - Name of the table
     * @param {string} field - Field to average
     * @param {Record<string, any>} criteria - Filter criteria (optional)
     * @returns {Promise<any>} Average result
     */
    static async avg(tableName: string, field: string, criteria: Record<string, any> = {}): Promise<any> {
        const payload: Record<string, any> = { operation: 'AVG', tableName, field };
        if (Object.keys(criteria).length > 0) {
            payload.criteria = criteria;
        }
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Find maximum value of a field
     * @param {string} tableName - Name of the table
     * @param {string} field - Field to find max
     * @param {Record<string, any>} criteria - Filter criteria (optional)
     * @returns {Promise<any>} Max result
     */
    static async max(tableName: string, field: string, criteria: Record<string, any> = {}): Promise<any> {
        const payload: Record<string, any> = { operation: 'MAX', tableName, field };
        if (Object.keys(criteria).length > 0) {
            payload.criteria = criteria;
        }
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Find minimum value of a field
     * @param {string} tableName - Name of the table
     * @param {string} field - Field to find min
     * @param {Record<string, any>} criteria - Filter criteria (optional)
     * @returns {Promise<any>} Min result
     */
    static async min(tableName: string, field: string, criteria: Record<string, any> = {}): Promise<any> {
        const payload: Record<string, any> = { operation: 'MIN', tableName, field };
        if (Object.keys(criteria).length > 0) {
            payload.criteria = criteria;
        }
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Group by field with aggregation
     * @param {string} tableName - Name of the table
     * @param {string} groupField - Field to group by
     * @param {Array<string>} aggregateFields - Fields to aggregate
     * @param {Array<string>} aggregateOperations - Aggregation operations
     * @param {Record<string, any>} criteria - Filter criteria (optional)
     * @returns {Promise<any>} Group by result
     */
    static async groupBy(tableName: string, groupField: string, aggregateFields: string[], aggregateOperations: string[], criteria: Record<string, any> = {}): Promise<any> {
        const payload: Record<string, any> = {
            operation: 'GROUP_BY',
            tableName,
            groupField,
            aggregateFields,
            aggregateOperations
        };
        if (Object.keys(criteria).length > 0) {
            payload.criteria = criteria;
        }
        return Database.request('/execute', 'POST', payload);
    }

    // ============================================================================
    // INDEX MANAGEMENT METHODS
    // ============================================================================

    /**
     * Create an index on table fields
     * @param {string} tableName - Name of the table
     * @param {string} indexName - Name of the index
     * @param {Array<string>} fields - Fields to index
     * @param {string} indexType - Type of index (btree, hash, etc.)
     * @returns {Promise<any>} Index creation result
     */
    static async createIndex(tableName: string, indexName: string, fields: string[], indexType: string = 'btree'): Promise<any> {
        const payload: Record<string, any> = {
            operation: 'CREATE_INDEX',
            tableName,
            indexName,
            fields,
            indexType
        };
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Drop an index
     * @param {string} tableName - Name of the table
     * @param {string} indexName - Name of the index to drop
     * @returns {Promise<any>} Index drop result
     */
    static async dropIndex(tableName: string, indexName: string): Promise<any> {
        const payload: Record<string, any> = {
            operation: 'DROP_INDEX',
            tableName,
            indexName
        };
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * List all indexes for a table
     * @param {string} tableName - Name of the table
     * @returns {Promise<any>} List of indexes
     */
    static async listIndexes(tableName: string): Promise<any> {
        const payload: Record<string, any> = {
            operation: 'LIST_INDEXES',
            tableName
        };
        return Database.request('/execute', 'POST', payload);
    }

    // ============================================================================
    // ADVANCED QUERY METHODS
    // ============================================================================

    /**
     * Execute raw SQL query
     * @param {string} sql - SQL query to execute
     * @param {Array<any>} parameters - Query parameters (optional)
     * @returns {Promise<any>} Query result
     */
    static async executeSQL(sql: string, parameters: any[] = []): Promise<any> {
        const payload: Record<string, any> = {
            operation: 'EXECUTE_SQL',
            sql,
            parameters
        };
        return Database.request('/execute', 'POST', payload);
    }

    /**
     * Perform a complex join query
     * @param {string} mainTable - Main table for the join
     * @param {Array<JoinDefinition>} joins - Array of join specifications
     * @param {Record<string, any>} options - Additional query options
     * @returns {Promise<any>} Join result
     */
    static async join(mainTable: string, joins: JoinDefinition[], options: Record<string, any> = {}): Promise<any> {
        const relations: RelationDefinition[] = joins.map(join => ({
            table: join.table,
            localField: join.on.split(' = ')[0].split('.')[1],
            foreignField: join.on.split(' = ')[1].split('.')[1],
            type: (join.type || 'INNER').toLowerCase() as 'inner' | 'left' | 'right' | 'outer'
        }));

        return Database.select(mainTable, {
            relations,
            ...options
        });
    }

    // ============================================================================
    // BATCH OPERATION METHODS
    // ============================================================================

    /**
     * Execute multiple operations in sequence
     * @param {Array<BatchOperation>} operations - Array of operations to execute
     * @returns {Promise<Array<any>>} Array of results
     */
    static async batch(operations: BatchOperation[]): Promise<any[]> {
        const results = [];
        for (const op of operations) {
            let result;
            switch (op.method.toLowerCase()) {
                case 'insert':
                    result = await Database.insert(op.table, op.data!);
                    break;
                case 'select':
                    result = await Database.select(op.table, op.options || {});
                    break;
                case 'update':
                    result = await Database.update(op.table, op.data!, op.criteria!);
                    break;
                case 'delete':
                    result = await Database.delete(op.table, op.criteria!);
                    break;
                default:
                    throw new Error(`Unknown operation method: ${op.method}`);
            }
            results.push(result);
        }
        return results;
    }

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    /**
     * Check if a table exists
     * @param {string} tableName - Name of the table to check
     * @returns {Promise<boolean>} True if table exists, false otherwise
     */
    static async tableExists(tableName: string): Promise<boolean> {
        try {
            await Database.getTableSchema(tableName);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get paginated results
     * @param {string} tableName - Name of the table
     * @param {number} page - Page number (1-based)
     * @param {number} pageSize - Number of records per page
     * @param {SelectOptions} options - Additional query options
     * @returns {Promise<PaginationResult<any>>} Paginated results with metadata
     */
    static async paginate(tableName: string, page: number = 1, pageSize: number = 10, options: SelectOptions = {}): Promise<PaginationResult<any>> {
        const offset = (page - 1) * pageSize;
        const result = await Database.select(tableName, {
            ...options,
            limit: pageSize,
            offset
        });

        // Get total count for pagination metadata
        const countResult = await Database.count(tableName, options.criteria || {});
        const totalRecords = countResult.data || 0;
        const totalPages = Math.ceil(totalRecords / pageSize);

        return {
            ...result,
            pagination: {
                currentPage: page,
                pageSize,
                totalRecords,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }

    /**
     * Search records with text matching
     * @param {string} tableName - Name of the table
     * @param {string} searchTerm - Term to search for
     * @param {Array<string>} searchFields - Fields to search in
     * @param {SelectOptions} options - Additional options
     * @returns {Promise<any>} Search results
     */
    static async search(tableName: string, searchTerm: string, searchFields: string[], options: SelectOptions = {}): Promise<any> {
        const criteria: Record<string, any> = {};
        searchFields.forEach(field => {
            criteria[field] = { $like: `%${searchTerm}%` };
        });

        return Database.select(tableName, {
            criteria,
            ...options
        });
    }

    /**
     * Backup table data to JSON
     * @param {string} tableName - Name of the table to backup
     * @returns {Promise<BackupData>} Backup data
     */
    static async backup(tableName: string): Promise<BackupData> {
        const result = await Database.select(tableName, { limit: 10000 });
        return {
            tableName,
            timestamp: new Date().toISOString(),
            recordCount: result.count,
            data: result.data
        };
    }

    /**
     * Restore table data from backup
     * @param {BackupData} backupData - Backup data object
     * @param {boolean} clearFirst - Whether to clear existing data first
     * @returns {Promise<any>} Restore result
     */
    static async restore(backupData: BackupData, clearFirst: boolean = false): Promise<any> {
        if (clearFirst) {
            await Database.delete(backupData.tableName, {});
        }

        const results = await Database.bulkInsert(backupData.tableName, backupData.data);
        return {
            success: true,
            message: `Restored ${results.length} records to ${backupData.tableName}`,
            recordCount: results.length
        };
    }
}

// ============================================================================
// EXPORT AND USAGE EXAMPLES
// ============================================================================

export default Database;

/* 
USAGE EXAMPLES WITH STATIC METHODS:

// Configure the database client (optional - uses defaults if not called)
Database.configure('http://localhost:7001/api/database', {
    timeout: 60000,
    headers: { 'Authorization': 'Bearer token' }
});

// Create a table
await Database.createTable('users', {
    name: { type: 'varchar', nullable: false },
    email: { type: 'varchar', nullable: false },
    age: { type: 'integer', nullable: true },
    status: { type: 'varchar', nullable: true }
});

// Insert data
await Database.insert('users', {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    status: 'active'
});

// Select with criteria
const users = await Database.select('users', {
    criteria: { status: 'active' },
    fields: ['name', 'email'],
    limit: 10
});

// Join tables
const userOrders = await Database.select('users', {
    relations: [{
        table: 'orders',
        localField: 'id',
        foreignField: 'user_id',
        type: 'inner'
    }],
    fields: ['name', 'email', 'orders.total_amount'],
    criteria: { 'orders.status': 'completed' }
});

// Aggregations
const userCount = await Database.count('users', { status: 'active' });
const avgAge = await Database.avg('users', 'age');
const totalSales = await Database.sum('orders', 'total_amount');

// Pagination
const page2 = await Database.paginate('users', 2, 20, {
    criteria: { status: 'active' }
});

// Search
const searchResults = await Database.search('users', 'john', ['name', 'email']);

// Batch operations
await Database.batch([
    { method: 'insert', table: 'users', data: { name: 'Jane', email: 'jane@example.com' }},
    { method: 'insert', table: 'users', data: { name: 'Bob', email: 'bob@example.com' }},
    { method: 'update', table: 'users', data: { status: 'verified' }, criteria: { name: 'John Doe' }}
]);

// Backup and restore
const backup = await Database.backup('users');
await Database.restore(backup, true);

*/