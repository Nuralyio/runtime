import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../../utils/common-editor-theme.ts";

export const StudioComponentNameInput = [
  {
    uuid: "component_value_text_block",
    application_id: "1",
    name: "value text block",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["component_value_text_label", "component_value_handler_block"]
  },
  {
    uuid: "component_value_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    component_type: ComponentType.Container,
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
    component_type: ComponentType.TextLabel,
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
    uuid: "component_value_text_input",
    name: "value text input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent) {
            updateName(selectedComponent, EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const { name } = Utils.first(Editor.selectedComponents) || {};
          return name;
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
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
    component_type: ComponentType.Event,
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
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const handlerValue = selectedComponent?.input?.value?.type === 'handler'
            ? selectedComponent?.input?.value.value
            : '';
          return ['value', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.value?.value) {
          updateInput(selectedComponent, 'value', 'handler', EventData.value);
        }
      `
    }
  }
];