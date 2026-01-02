import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export const StudioTextValueInput = [
  {
    uuid: "value_text_block",
    application_id: "1",
    name: "value text block",
    type: "container",
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["value_text_label", "value_handler_block"]
  },
  {
    uuid: "value_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    children_ids: ["value_text_input", "value_handler"]
  },
  {
    uuid: "value_text_label",
    name: "value text label",
    type: "text_label",
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'Value'
      }
    }
  },
  {
    uuid: "value_text_input",
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
          updateInput(selectedComponent, 'value', 'value', EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const { input: { value: valueInput } = {} } = Utils.first($selectedComponents) || {};
          return valueInput?.type === 'handler' ? '' : valueInput?.value || '';
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
    uuid: "value_handler",
    application_id: "1",
    type: "event",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
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