import leftPanelTabs from "./left-panel-tabs";
import { leftPanelContainer } from "./left-panel/container";
import { componentPanelComponents } from "./left-panel/component-panel";
import { filesMicroApp, filesAppUUID, filesPageUUID } from "./left-panel/files/micro-app";
import { pagesPanelComponents } from "./left-panel/pages";
import { workflowPanelComponents } from "./left-panel/workflow";
import { databasePanelComponents } from "./left-panel/database";

export { filesAppUUID, filesPageUUID };

export default [
  leftPanelContainer,
  leftPanelTabs,
  ...componentPanelComponents,
  filesMicroApp,
  ...pagesPanelComponents,
  ...workflowPanelComponents,
  ...databasePanelComponents
];