import { ComponentType } from "@shared/redux/store/component/component.interface";

//@todo check if this still used
export default {
  uuid: "left_panel_tabs",
  application_id: "1",
  name: "left_panel_tabs",
  component_type: ComponentType.Tabs,
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
          icon :{
            type:"string",
            value:"panel-top"
          },
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
          childrends: {
            type: "componentIdArray",
            value: ["files_micro_app_block"]
          }
        },
        {
          label: {
            type: "text",
            value: "Files"
          },
          childrends: {
            type: "componentIdArray",
            value: []
          }
        }
      ]
    }
  }
};
