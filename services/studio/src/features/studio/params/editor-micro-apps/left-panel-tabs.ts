export default {
  uuid: "left_panel_tabs",
  application_id: "1",
  name: "left_panel_tabs",
  type: "tabs",
  event: {},
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
    "--nuraly-tabs-content-padding": "0px",
    "--nuraly-border-width-tabs-content-top": "0px",
    "--nuraly-spacing-tabs-content-padding-small": "0px"
  },
  input: {
    size: {
      type: "string",
      value: "small"
    },
    tabs: {
      type: "json",
      value: [
        {
          label: {
            type: "text",
            value: "Pages"
          },
          icon: {
            type: "string",
            value: "panel-top"
          },
          key: "pages",
          childrends: {
            type: "componentIdArray",
            value: ["pages_panel"]
          }
        },
        {
          label: {
            type: "text",
            value: "Functions"
          },
          icon: {
            type: "string",
            value: "parentheses"
          },
          key: "functions",
          childrends: {
            type: "componentIdArray",
            value: ["function_micro_app_block"]
          }
        }
      ]
    }
  }
};
