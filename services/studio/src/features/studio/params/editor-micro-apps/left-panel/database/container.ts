export const databaseConnectionsPanel = {
  uuid: "database_connections_panel",
  application_id: "1",
  name: "Database connections panel",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "292px",
    height: "100%",
    "--nuraly-button-font-size": "12px"
  },
  children_ids: ["database_connections_header", "database_connections_menu"]
};

export const databaseSchemaPanel = {
  uuid: "database_schema_panel",
  application_id: "1",
  name: "Database schema panel",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "292px",
    height: "100%",
    "--nuraly-button-font-size": "12px"
  },
  children_ids: ["database_schema_header", "database_schema_menu", "database_tables_menu"]
};
