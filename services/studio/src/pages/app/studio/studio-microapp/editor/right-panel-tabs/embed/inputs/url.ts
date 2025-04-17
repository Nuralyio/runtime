import { ComponentType } from "$store/component/interface.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";

export const EmbedURLInput=  [
  {
    uuid: "embed_url_block",
    application_id: "1",
    name: "embed url block",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["embed_url_input_block", "embed_handler_block"]
  },
  {
    uuid: "embed_url_input_block",
    application_id: "1",
    name: "label input block",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["embed_url_label"]
  },
  {
    uuid: "embed_url_label",
    name: "embed url label",
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
    uuid: "embed_url_input",
    name: "embed url input",
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
    uuid: "embed_handler_block",
    application_id: "1",
    name: "label handler block",
    component_type: ComponentType.Container,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["embed_url_input", "embed_handler"]
  },
  {
    uuid: "embed_handler",
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