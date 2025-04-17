import { ComponentType } from "$store/component/interface.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export const LinkURLInput=  [
  {
    uuid: "link_url_block",
    application_id: "1",
    name: "link url block",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["link_url_input_block", "link_handler_block"]
  },
  {
    uuid: "link_url_input_block",
    application_id: "1",
    name: "label input block",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["link_url_label"]
  },
  {
    uuid: "link_url_label",
    name: "link url label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'URL'
      }
    }
  },
  {
    uuid: "link_url_input",
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
          updateInput(selectedComponent, 'url', 'value', EventData.value);
        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'url') : null;
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
        value: /* js */ `return "https://nuraly.io";`
      }
    }
  },
  {
    uuid: "link_handler_block",
    application_id: "1",
    name: "label handler block",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["link_url_input", "link_handler"]
  },
  {
    uuid: "link_handler",
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
          const handlerValue = selectedComponent?.input?.label?.type === 'handler'
            ? selectedComponent?.input?.label.value
            : '';
          return ['url', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.label?.value) {
          updateInput(selectedComponent, 'url', 'handler', EventData.value);
        }
      `
    }
  }
];