/**
 * @fileoverview Database Runtime API Functions
 * @module Runtime/Handlers/RuntimeAPI/Database
 */

import {
  $conduitState,
  $databaseConnections,
  selectConnection,
  selectSchema,
  selectTable,
  runQuery,
  testCurrentConnection,
  clearConduitState,
  type DatabaseConnection,
} from '../../redux/store/conduit';
import { clearConnectionCache } from '../../redux/store/database';
import { $currentApplication } from '../../redux/store/apps';

/**
 * Creates database-related functions for handler code
 */
export function createDatabaseFunctions() {
  return {
    /**
     * Select a database connection
     */
    selectDatabaseConnection: async (connection: DatabaseConnection) => {
      const appId = $currentApplication.get()?.uuid;
      if (appId) {
        return selectConnection(connection, appId);
      }
    },

    /**
     * Select a schema
     */
    selectDatabaseSchema: async (schemaName: string) => {
      const appId = $currentApplication.get()?.uuid;
      if (appId) {
        return selectSchema(schemaName, appId);
      }
    },

    /**
     * Select a table
     */
    selectDatabaseTable: async (tableName: string) => {
      const appId = $currentApplication.get()?.uuid;
      if (appId) {
        return selectTable(tableName, appId);
      }
    },

    /**
     * Run a database query
     */
    runDatabaseQuery: async (query: any) => {
      const appId = $currentApplication.get()?.uuid;
      if (appId) {
        return runQuery(appId, query);
      }
    },

    /**
     * Test the current connection
     */
    testDatabaseConnection: async () => {
      const appId = $currentApplication.get()?.uuid;
      if (appId) {
        return testCurrentConnection(appId);
      }
    },

    /**
     * Refresh database schema (clear cache and reload)
     */
    refreshDatabaseSchema: async () => {
      const state = $conduitState.get();
      const appId = $currentApplication.get()?.uuid;
      if (state.currentConnection && appId) {
        clearConnectionCache(state.currentConnection.path, appId);
        // Re-select the current connection to reload data
        return selectConnection(state.currentConnection, appId);
      }
    },

    /**
     * Get current database state
     */
    getDatabaseState: () => {
      return $conduitState.get();
    },

    /**
     * Get database connections
     */
    getDatabaseConnections: () => {
      return $databaseConnections.get();
    },

    /**
     * Clear database state
     */
    clearDatabaseState: () => {
      clearConduitState();
    },
  };
}
