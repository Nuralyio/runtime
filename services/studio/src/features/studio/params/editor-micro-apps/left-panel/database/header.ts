export const databaseConnectionsHeader = {
  uuid: "database_connections_header",
  application_id: "1",
  name: "Database connections header",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "horizontal"
    }
  },
  style: {
    width: "100%",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb"
  },
  children_ids: ["database_connections_title", "database_add_connection_button"]
};

export const databaseConnectionsTitle = {
  uuid: "database_connections_title",
  application_id: "1",
  name: "Database connections title",
  type: "text_label",
  input: {
    value: {
      type: "string",
      value: "Connections"
    }
  },
  style: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#374151"
  }
};

export const databaseSchemaHeader = {
  uuid: "database_schema_header",
  application_id: "1",
  name: "Database schema header",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "horizontal"
    }
  },
  style: {
    width: "100%",
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb"
  },
  children_ids: ["database_schema_title", "database_refresh_button"]
};

export const databaseSchemaTitle = {
  uuid: "database_schema_title",
  application_id: "1",
  name: "Database schema title",
  type: "text_label",
  input: {
    value: {
      type: "handler",
      value: /* js */ `
        const conn = GetVar("currentDatabaseConnection");
        return conn ? conn.name + " - Schema" : "Schema";
      `
    }
  },
  style: {
    fontWeight: "600",
    fontSize: "13px",
    color: "#374151"
  }
};
