import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export const StudioComponentNameInput = [
  {
    uuid: "component_value_text_block",
    application_id: "1",
    name: "value text block",
    component_type: "vertical-container-block",
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["component_value_text_label", "component_value_handler_block"]
  },
  {
    uuid: "component_value_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "margin-right" :  "30px"
    },
    childrenIds: ["component_value_text_input"]
  },
  {
    uuid: "component_value_text_label",
    name: "value text label",
    component_type: "text_label",
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'Name'
      }
    }
  },
  {
    uuid: "component_value_text_input",
    name: "value text input",
    application_id: "1",
    component_type: "text_input",
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent) {
            updateName(selectedComponent, EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const { name } = Utils.first($selectedComponents) || {};
          return name;
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
        value: "value"
      }
    }
  },
  {
    uuid: "component_value_handler",
    application_id: "1",
    component_type: "event",
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "value handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          const handlerValue = selectedComponent?.input?.value?.type === 'handler'
            ? selectedComponent?.input?.value.value
            : '';
          return ['value', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.value?.value) {
          updateInput(selectedComponent, 'value', 'handler', EventData.value);
        }
      `
    }
  }
];