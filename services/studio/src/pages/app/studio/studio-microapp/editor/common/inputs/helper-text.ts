import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "helper_text_block",
    application_id: "1",
    name: "helper text block",
    component_type: ComponentType.Container,
    styleHandlers: {},
    input: {
      direction: "vertical"
    },
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["helper_input_block", "helper_handler_block"]
  },
  {
    uuid: "helper_input_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["helper_text_label"]
  },
  {
    uuid: "helper_text_label",
    name: "helper text label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Helper text'
      }
    },
    style: {
      "width": "90px"
    }
  },
  {
    uuid: "helper_text_input",
    name: "helper text input",
    application_id: "1",
    component_type: ComponentType.TextInput,
    styleHandlers: {},
    ...COMMON_ATTRIBUTES,
    style: {
      ...TextInputTheme
    },
    event: {
      valueChange:  /* js */ `
        try {
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent) {
            const newHelperText = EventData.value;
            updateInput(selectedComponent, 'helper', 'value', newHelperText);
          }
        } catch(error) {
          console.log(error);
        } 
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const helperInput = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'helper') : null;
          return helperInput?.type === "value" ? helperInput.value ?? '' : '';
        `
      },
      state: {
        type: "handler",
        value: /* js */`
            const selectedComponent = Utils.first(Editor.selectedComponents);
            let state = "unabled";
            if (selectedComponent?.input?.helper?.type == "handler" && 
                selectedComponent?.input?.helper?.value) {
              state = "disabled";
            }
            return state;
        `
      },
      placeholder: {
        type: "handler",
        value: /* js */`
          return "helper text";
        `
      }
    }
  },
  {
    uuid: "helper_handler_block",
    application_id: "1",
    name: "helper handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["helper_text_input", "helper_handler"]
  },
  {
    uuid: "helper_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "helper handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const parameter = 'helper';
            let helperHandler = '';
            const selectedComponent = Utils.first(Editor.selectedComponents);
            if (selectedComponent?.input?.helper?.type == 'handler' && 
                selectedComponent?.input?.helper?.value) {
              helperHandler = selectedComponent.input.helper.value;
            }
            return [parameter, helperHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent && EventData.value !== selectedComponent?.input?.helper?.value) {
            updateInput(selectedComponent, 'helper', 'handler', EventData.value);
          }
      `
    }
  }
];