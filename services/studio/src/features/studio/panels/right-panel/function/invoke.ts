import { COMMON_ATTRIBUTES } from '../../../core/helpers/common_attributes.ts';

export default [
    {
      uuid: "right_panel_function_invoke",
      application_id: "1",
      name: "Parent Color Container",
      type: "container",
      ...COMMON_ATTRIBUTES,
      style: {
        display: "flex",
        "flex-direction": "column",
        width :"300px"
      },
      children_ids: ["invoke_function_block"]
    },
  {
    uuid: "invoke_text_label",
    name: "invoke_text_label",
    type: "text_label",
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
    type: "invoke_function",
    style: {

    },
    input: {

    }
  },
  ]