import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export default [
  {
    uuid: "label_text_block",
    application_id: "1",
    name: "label text block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["label_text_input_block", "label_handler_block"]
  },
  {
    uuid: "label_text_input_block",
    application_id: "1",
    name: "label input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["label_text_label"]
  },
  {
    uuid: "label_text_label",
    name: "label text label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'Label'
      }
    }
  },
  {
    uuid: "label_text_input",
    name: "label text input",
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
          updateInput(selectedComponent, 'label', 'value', EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'label') : null;
        return Input?.type === "value" ? Input.value ?? '' : '';
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          return selectedComponent?.input?.label?.type === "handler" &&
            selectedComponent?.input?.label?.value
            ? "disabled"
            : "unabled";
        `
      },
      placeholder: {
        type: "handler",
        value: /* js */ `return "label";`
      }
    }
  },
  {
    uuid: "label_handler_block",
    application_id: "1",
    name: "label handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["label_text_input", "label_handler"]
  },
  {
    uuid: "label_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "label handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          const handlerValue = selectedComponent?.input?.label?.type === 'handler'
            ? selectedComponent?.input?.label.value
            : '';
          return ['label', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.label?.value) {
          updateInput(selectedComponent, 'label', 'handler', EventData.value);
        }
      `
    }
  }
];