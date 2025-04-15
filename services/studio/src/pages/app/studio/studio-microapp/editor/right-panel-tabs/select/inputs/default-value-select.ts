import { ComponentType } from "$store/component/interface.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export const DefaultValueSelectInput=  [
  {
    uuid: "default_value_block",
    application_id: "1",
    name: "link url block",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["default_value_input_block", "default_value_handler_block"]
  },
  {
    uuid: "default_value_input_block",
    application_id: "1",
    name: "label input block",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["default_value_label"]
  },
  {
    uuid: "default_value_label",
    name: "link url label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'Default'
      }
    }
  },
  {
    uuid: "default_value_input",
    name: "link url input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent) {
          updateInput(selectedComponent, 'defaultSelected', 'value', EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'defaultSelected') : null;
        return Input?.type === "value" ? Input.value ?? '' : '';
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          return selectedComponent?.input?.defaultSelected?.type === "handler" &&
            selectedComponent?.input?.defaultSelected?.value
            ? "disabled"
            : "unabled";
        `
      },
      placeholder: {
        type: "handler",
        value: /* js */ `return "";`
      }
    }
  },
  {
    uuid: "default_value_handler_block",
    application_id: "1",
    name: "label handler block",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["default_value_input", "default_value_handler"]
  },
  {
    uuid: "default_value_handler",
    application_id: "1",
    component_type: ComponentType.Event,
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
          const handlerValue = selectedComponent?.input?.defaultSelected?.type === 'handler'
            ? selectedComponent?.input?.defaultSelected.value
            : '';
          return ['defaultSelected', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.defaultSelected?.value) {
          updateInput(selectedComponent, 'defaultSelected', 'handler', EventData.value);
        }
      `
    }
  }
];