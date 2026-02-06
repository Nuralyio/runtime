export const databaseConnectionsMenu = {
  uuid: "database_connections_menu",
  application_id: "1",
  name: "Database connections menu",
  type: "menu",
  input: {
    size: {
      type: "string",
      value: "small"
    },
    arrowPosition: {
      type: "string",
      value: "left"
    },
    options: {
      type: "handler",
      value: /* js */ `
        // Check if connections are already loaded
        let connections = GetVar("databaseConnections") || [];

        // Connections should be pre-loaded into the variable store by the host (Database.ts).
        // If they haven't loaded yet, show a placeholder instead of fetching inline.
        if (connections.length === 0) {
          return [{ text: "Loading connections...", id: "loading", icon: "loader", disabled: true }];
        }

        const currentConn = GetVar("currentDatabaseConnection");

        return connections.map(conn => ({
          text: conn.name,
          id: conn.path,
          icon: conn.type === 'postgresql' ? 'database' :
                conn.type === 'mysql' ? 'database' :
                conn.type === 'mongodb' ? 'database' : 'database',
          selected: currentConn?.path === conn.path,
          badge: conn.type
        }));
      `
    }
  },
  event: {
    onSelect: /* js */ `
      if (EventData.id === "empty") return;

      const connections = GetVar("databaseConnections") || [];
      const selectedConn = connections.find(c => c.path === EventData.id);
      if (selectedConn) {
        selectDatabaseConnection(selectedConn);
      }
    `
  },
  style: {
    width: "100%",
    flex: "1",
    overflowY: "auto",
    "--nuraly-menu-border": "none",
    "--nuraly-menu-font-size": "13px",
    "margin-left": "13px",
    "margin-top": "11px"
  }
};

export const databaseSchemaMenu = {
  uuid: "database_schema_menu",
  application_id: "1",
  name: "Database schema menu",
  type: "menu",
  input: {
    size: {
      type: "string",
      value: "small"
    },
    arrowPosition: {
      type: "string",
      value: "left"
    },
    label: {
      type: "string",
      value: "Schemas"
    },
    options: {
      type: "handler",
      value: /* js */ `
        const conn = GetVar("currentDatabaseConnection");
        if (!conn) {
          return [{ text: "Select a connection first", id: "empty", icon: "info", disabled: true }];
        }

        const appId = GetVar("currentEditingApplication")?.uuid;
        if (!appId) return [];

        return fetch("/api/v1/db/schemas?applicationId=" + appId + "&connectionPath=" + encodeURIComponent(conn.path))
          .then(res => res.json())
          .then(schemas => {
            if (!schemas || schemas.length === 0) {
              return [{ text: "No schemas", id: "empty", icon: "info", disabled: true }];
            }

            const currentSchema = GetVar("currentSchema");

            return schemas.map(s => ({
              text: s.name,
              id: s.name,
              icon: "folder",
              selected: currentSchema === s.name,
              badge: s.tableCount + " tables"
            }));
          })
          .catch(err => {
            console.error("Failed to load schemas:", err);
            return [{ text: "Error loading schemas", id: "error", icon: "alert-triangle", disabled: true }];
          });
      `
    }
  },
  event: {
    onSelect: /* js */ `
      if (EventData.id === "empty" || EventData.id === "error") return;
      selectDatabaseSchema(EventData.id);
    `
  },
  style: {
    width: "100%",
    maxHeight: "150px",
    overflowY: "auto",
    "--nuraly-menu-border": "none",
    "--nuraly-menu-font-size": "13px",
    "margin-left": "13px",
    "margin-top": "8px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px"
  }
};

export const databaseTablesMenu = {
  uuid: "database_tables_menu",
  application_id: "1",
  name: "Database tables menu",
  type: "menu",
  input: {
    size: {
      type: "string",
      value: "small"
    },
    arrowPosition: {
      type: "string",
      value: "left"
    },
    label: {
      type: "string",
      value: "Tables"
    },
    options: {
      type: "handler",
      value: /* js */ `
        const conn = GetVar("currentDatabaseConnection");
        const schema = GetVar("currentSchema");
        if (!conn || !schema) {
          return [{ text: "Select a schema first", id: "empty", icon: "info", disabled: true }];
        }

        const appId = GetVar("currentEditingApplication")?.uuid;
        if (!appId) return [];

        return fetch("/api/v1/db/tables?applicationId=" + appId + "&connectionPath=" + encodeURIComponent(conn.path) + "&schema=" + schema)
          .then(res => res.json())
          .then(tables => {
            if (!tables || tables.length === 0) {
              return [{ text: "No tables", id: "empty", icon: "info", disabled: true }];
            }

            const currentTable = GetVar("currentTable");

            return tables.map(t => ({
              text: t.name,
              id: t.name,
              icon: t.type === 'view' ? 'eye' : 'table',
              selected: currentTable === t.name,
              badge: t.type
            }));
          })
          .catch(err => {
            console.error("Failed to load tables:", err);
            return [{ text: "Error loading tables", id: "error", icon: "alert-triangle", disabled: true }];
          });
      `
    }
  },
  event: {
    onSelect: /* js */ `
      if (EventData.id === "empty" || EventData.id === "error") return;
      selectDatabaseTable(EventData.id);
    `
  },
  style: {
    width: "100%",
    flex: "1",
    overflowY: "auto",
    "--nuraly-menu-border": "none",
    "--nuraly-menu-font-size": "13px",
    "margin-left": "13px",
    "margin-top": "8px"
  }
};
