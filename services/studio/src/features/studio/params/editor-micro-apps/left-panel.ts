import leftPanelTabs from "./left-panel-tabs";
import { leftPanelContainer } from "./left-panel/container";
import { componentPanelComponents } from "./left-panel/component-panel";
import { filesMicroApp, filesAppUUID, filesPageUUID } from "./left-panel/files/micro-app";
import { pagesPanelComponents } from "./left-panel/pages";

export { filesAppUUID, filesPageUUID };

export default [
  leftPanelContainer,
  leftPanelTabs,
  ...componentPanelComponents,
  filesMicroApp,
  ...pagesPanelComponents
];