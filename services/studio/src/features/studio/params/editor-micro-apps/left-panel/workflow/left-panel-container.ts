export const workflowLeftPanelContainer = {
  uuid: "workflow_left_panel_container",
  application_id: "1",
  name: "Workflow Left panel",
  type: "container",
  input: {
    direction: {
      type: "string",
      value: "vertical"
    }
  },
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
  },
  children_ids: ["workflow_left_panel_tabs"]
};

export const workflowLeftPanelTabs = {
  uuid: "workflow_left_panel_tabs",
  application_id: "1",
  name: "workflow_left_panel_tabs",
  type: "tabs",
  event: {},
  style: {
    "--nuraly-border-width-tabs-content-top": "0px",
    "--nuraly-border-width-tabs-top": "0px",
    "--nuraly-border-width-tabs-right": "0px",
    "--nuraly-border-width-tabs-bottom": "1px",
    "--nuraly-border-width-tabs-left": "0px",
    "--nuraly-spacing-tabs-content-padding-small": "0px",
    "--nuraly-border-width-tabs-top-hover": "0px",
    "--nuraly-border-width-tabs-right-hover": "0px",
    "--nuraly-border-width-tabs-bottom-hover": "1px",
    "--nuraly-border-width-tabs-left-hover": "0px",
    "--nuraly-border-width-tabs-top-active": "0px",
    "--nuraly-border-width-tabs-right-active": "1px",
    "--nuraly-border-width-tabs-bottom-active": "0px",
    "--nuraly-border-width-tabs-left-active": "1px",
    "--nuraly-border-width-tabs-top-focus": "2px",
    "--nuraly-border-width-tabs-right-focus": "2px",
    "--nuraly-border-width-tabs-bottom-focus": "2px",
    "--nuraly-border-width-tabs-left-focus": "2px",
    "--nuraly-tabs-labels-gap": "0px",
    "--nuraly-panel-small-height": "400px",
    "--nuraly-border-radius-small": "0px",
    "--nuraly-label-font-weight": "350",
    "--nuraly-panel-header-background": "#fcfcfc",
    height: "100%",
    "overflow-y": "auto",
    "--nuraly-panel-body-padding-small": "0px"
  },
  input: {
    panelConfig: {
      type: "object",
      value: {
        enabled: false,
        mode: 'embedded',
        resizable: false,
        title: 'Panel Tabs',
      }
    },
    align: {
      type: "string",
      value: "stretch"
    },
    size: {
      type: "string",
      value: "small"
    },
    index: {
      type: "number",
      value: 0
    },
    tabs: {
      type: "json",
      value: [
        {
          label: { type: "text", value: "Workflow" },
          icon: { type: "string", value: "git-branch" },
          key: "workflow",
          childrends: { type: "componentIdArray", value: ["workflow_list_panel"] }
        },
        {
          label: { type: "text", value: "Versions" },
          icon: { type: "string", value: "history" },
          key: "revisions",
          childrends: { type: "componentIdArray", value: ["revision_panel_component"] }
        }
      ]
    }
  }
};
