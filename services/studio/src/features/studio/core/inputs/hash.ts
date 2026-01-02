import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export const StudioComponentHashInput = [
  {
    uuid: "component_hash_text_block",
    application_id: "1",
    name: "hash text block",
    type: "container",
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["component_hash_text_label", "component_hash_handler_block"]
  },
  {
    uuid: "component_hash_handler_block",
    application_id: "1",
    name: "hash handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "margin-right": "30px"
    },
    children_ids: ["component_hash_text_input"]
  },
  {
    uuid: "component_hash_text_label",
    name: "hash text label",
    type: "text_label",
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'Hash'
      }
    }
  },
  {
    uuid: "component_hash_text_input",
    name: "hash text input",
    application_id: "1",
    type: "text_input",
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          return Utils.first($selectedComponents)?.uniqueUUID ?? ""
        `
      },
      state: {
        type: "string",
        value: "disabled"
      },
      placeholder: {
        type: "string",
        value: "hash"
      }
    }
  }
];
