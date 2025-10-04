import { ComponentType } from "@shared/redux/store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export default [
  {
    uuid: "placeholder_text_block",
    application_id: "1",
    name: "placeholder text block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["placeholder_input_block", "placeholder_handler_block"]
  },
  {
    uuid: "placeholder_input_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["placeholder_text_label"]
  },
  {
    uuid: "placeholder_text_label",
    name: "placeholder text label",
    component_type: ComponentType.TextLabel,
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
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent) {
          updateInput(selectedComponent, 'placeholder', 'value', EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'placeholder') : null;
        return Input?.type === "value" ? Input.value ?? '' : '';
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
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
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["placeholder_text_input", "placeholder_handler"]
  },
  {
    uuid: "placeholder_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "placeholder handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          const handlerValue = selectedComponent?.input?.placeholder?.type === 'handler'
            ? selectedComponent?.input?.placeholder.value
            : '';
          return ['placeholder', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.placeholder?.value) {
          updateInput(selectedComponent, 'placeholder', 'handler', EventData.value);
        }
      `
    }
  }
];