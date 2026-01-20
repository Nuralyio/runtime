import { databaseConnectionsPanel, databaseSchemaPanel } from "./container";
import { databaseConnectionsHeader, databaseConnectionsTitle, databaseSchemaHeader, databaseSchemaTitle } from "./header";
import { databaseConnectionsMenu, databaseSchemaMenu, databaseTablesMenu } from "./menu";
import { databaseAddConnectionButton, databaseRefreshButton } from "./add-button";
import { databaseLeftPanelContainer, databaseLeftPanelTabs } from "./left-panel-container";

export const databasePanelComponents = [
  databaseLeftPanelContainer,
  databaseLeftPanelTabs,
  databaseConnectionsPanel,
  databaseSchemaPanel,
  databaseConnectionsHeader,
  databaseConnectionsTitle,
  databaseSchemaHeader,
  databaseSchemaTitle,
  databaseConnectionsMenu,
  databaseSchemaMenu,
  databaseTablesMenu,
  databaseAddConnectionButton,
  databaseRefreshButton
];
