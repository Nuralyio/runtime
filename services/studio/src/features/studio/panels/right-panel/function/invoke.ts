import { COMMON_ATTRIBUTES } from '../../../core/helpers/common_attributes.ts';

export default [
    {
      uuid: "right_panel_function_invoke",
      application_id: "1",
      name: "Parent Color Container",
      component_type: "vertical-container-block",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column",
        width :"300px"
      },
      childrenIds: ["invoke_function_block"]
    },
  {
    uuid: "invoke_text_label",
    name: "invoke_text_label",
    component_type: "text_label",
    style: {
    },
    input: {
      value: {
        type: "string",
        value: /* js */`Invoke
            `
      }
    }
  },
  {
    uuid: "invoke_function_block",
    name: "invoke_function_block",
    component_type: "InvokeFunction",
    style: {

    },
    input: {

    }
  },
  ]