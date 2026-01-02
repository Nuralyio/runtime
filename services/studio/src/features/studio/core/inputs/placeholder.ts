import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export default [
  {
    uuid: "placeholder_text_block",
    application_id: "1",
    name: "placeholder text block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["placeholder_input_block", "placeholder_handler_block"]
  },
  {
    uuid: "placeholder_input_block",
    application_id: "1",
    name: "placeholder block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {},
    children_ids: ["placeholder_text_label"]
  },
  {
    uuid: "placeholder_text_label",
    name: "placeholder text label",
    type: "text_label",
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Placeholder'
      }
    },
    style: {
      "width": "90px"
    }
  },
  {
    uuid: "placeholder_text_input",
    name: "placeholder text input",
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
          updateInput(selectedComponent, 'placeholder', 'value', EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'placeholder') : null;
        return Input?.type === "value" ? Input.value ?? '' : '';
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          return selectedComponent?.input?.placeholder?.type === "handler" &&
            selectedComponent?.input?.placeholder?.value
            ? "disabled"
            : "unabled";
        `
      },
      placeholder: {
        type: "handler",
        value: /* js */ `return "placeholder";`
      }
    }
  },
  {
    uuid: "placeholder_handler_block",
    application_id: "1",
    name: "placeholder handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    children_ids: ["placeholder_text_input", "placeholder_handler"]
  },
  {
    uuid: "placeholder_handler",
    application_id: "1",
    type: "event",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "placeholder handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);
          const handlerValue = selectedComponent?.input?.placeholder?.type === 'handler'
            ? selectedComponent?.input?.placeholder.value
            : '';
          return ['placeholder', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first($selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.placeholder?.value) {
          updateInput(selectedComponent, 'placeholder', 'handler', EventData.value);
        }
      `
    }
  }
];