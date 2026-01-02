import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export const StudioComponentIdInput = [
  {
    uuid: "component_id_text_block",
    application_id: "1",
    name: "value text block",
    type: "container",
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["component_id_text_label", "component_id_handler_block"]
  },
  {
    uuid: "component_id_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "margin-right" :  "30px"
    },
    children_ids: ["component_id_text_input"]
  },
  {
    uuid: "component_id_text_label",
    name: "value text label",
    type: "text_label",
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'ID'
      }
    }
  },
  {
    uuid: "component_id_text_input",
    name: "value text input",
    application_id: "1",
    type: "text_input",
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent) {
            updateInput(selectedComponent, "id", 'string',EventData.value);

        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        return Utils.first($selectedComponents)?.input?.id?.value ?? ""
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.input?.value?.type === "handler" &&
            selectedComponent?.input?.value?.value
            ? "disabled"
            : "unabled";
        `
      },
      placeholder: {
        type: "string",
        value: "id"
      }
    }
  },
  {
    uuid: "component_id_handler",
    application_id: "1",
    type: "event",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "value handler",
    style: {
      display: "block"
    },
    input: {
      id: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          const handlerValue = selectedComponent?.input?.value?.type === 'handler'
            ? selectedComponent?.input?.value.value
            : '';
          return ['id', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.value?.value) {
          updateInput(selectedComponent, 'id', 'handler', EventData.value);
        }
      `
    }
  }
];