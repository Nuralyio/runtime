export const databaseAddConnectionButton = {
  uuid: "database_add_connection_button",
  application_id: "1",
  name: "Add database connection button",
  type: "button_input",
  input: {
    label: {
      type: "string",
      value: ""
    },
    icon: {
      type: "string",
      value: "plus"
    },
    size: {
      type: "string",
      value: "small"
    },
    variant: {
      type: "string",
      value: "ghost"
    }
  },
  event: {
    onClick: /* js */ `
      // Open KV Storage modal for creating a new database connection
      // The user can create connection credentials there with the proper format
      ShowToast({ message: "Use KV Storage to create database connections (e.g., postgresql/my-connection)", type: "info" });
    `
  },
  style: {
    "--nuraly-button-padding": "4px 8px"
  }
};

export const databaseRefreshButton = {
  uuid: "database_refresh_button",
  application_id: "1",
  name: "Refresh database schema button",
  type: "button_input",
  input: {
    label: {
      type: "string",
      value: ""
    },
    icon: {
      type: "string",
      value: "refresh-cw"
    },
    size: {
      type: "string",
      value: "small"
    },
    variant: {
      type: "string",
      value: "ghost"
    }
  },
  event: {
    onClick: /* js */ `
      const conn = GetVar("currentDatabaseConnection");
      if (conn) {
        refreshDatabaseSchema();
        ShowToast({ message: "Refreshing schema...", type: "info" });
      }
    `
  },
  style: {
    "--nuraly-button-padding": "4px 8px"
  }
};
