import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { filesAppUUID, filesPageUUID } from "@features/studio/params/editor-micro-apps/left-panel.ts";
import { COMMON_ATTRIBUTES } from "../../core/helpers/common_attributes.ts";
import FunctionBlocks from './function/index.ts';
export default [{
  uuid: "right_panel_function_tabs",
  application_id: "1",
  name: "right_panel_function_tabs",
  component_type: ComponentType.Tabs,
  event: {},
  style: {
    width: "100%",
    height: "100%",
    display: "grid",
    "--nuraly-tabs-content-padding": "0px"
  },
  input: {
    size: {
        type: "string",
        value: "small"
      },
    tabs: {
      type: "handler",
      value: /* js */ `
      return [
                 
                    {
                        label: {
                            type: "text",
                            value: "Debug"
                        },
                        childrends: {
                            type: "componentIdArray",
                            value:  ["right_panel_function_tabs_block"]
                        }
                    },
                    ]
      `
    }
  }
},
  {
    uuid: "right_panel_function_tabs_block",
    application_id: "1",
    name: "Parent Color Container",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "flex-direction": "column"
    },
    childrenIds: ["right_panel_function_invoke"]
  },
   {
    application_id: "1",
    uuid: "files_micro__right_app_block",
    name: "function_micro_app",
    component_type: ComponentType.MicroApp,
    input: {
      appUUID: {
        type: "string",
        value: filesAppUUID
      },
      componentToRenderUUID: {
        type: "string",
        value: filesPageUUID
      },
      mode: {
        type: "string",
        value: "preview"
      }
    },
  },
  ...FunctionBlocks
  ];