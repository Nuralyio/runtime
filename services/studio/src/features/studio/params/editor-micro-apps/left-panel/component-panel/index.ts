import { componentCollectionComponents } from "./component-collections";

export const componentPanel = {
  application_id: "1",
  uuid: "component_panel",
  name: "Files panel",
  type: "panel",
  input: {
    title: {
      type: "string",
      value: "Components"
    },
    mode: {
      type: "string",
      value: "embedded"
    },
    size: {
      type: "string",
      value: "small"
    },
    closable: {
      type: "boolean",
      value: false
    },
    resizable: {
      type: "boolean",
      value: true
    }
  },
  style: {
    "--nuraly-panel-small-width": "292px",
    "--nuraly-panel-small-height": "400px",
    "--nuraly-border-radius-small": "0px",
    "--nuraly-label-font-weight": "350",
    "--nuraly-panel-header-background": "#fcfcfc",
    "--nuraly-panel-body-padding-small": "0px",
    height: "100%",
    "overflow-y": "auto",
    
},
  children_ids: ["component_collection"]
};

export const componentPanelComponents = [
  componentPanel,
  ...componentCollectionComponents
];
