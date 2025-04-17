import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../helper/common_attributes.ts";
import FunctionBlocks from './function/index.ts'
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
    "--hybrid-tabs-content-padding": "0px"
  },
  input: {
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
  ...FunctionBlocks
  ];