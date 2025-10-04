import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, TextInputTheme } from "../utils/common-editor-theme.ts";

export const StudioComponentIdInput = [
  {
    uuid: "component_id_text_block",
    application_id: "1",
    name: "value text block",
    component_type: ComponentType.Container,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["component_id_text_label", "component_id_handler_block"]
  },
  {
    uuid: "component_id_handler_block",
    application_id: "1",
    name: "icon picker handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between",
      "margin-right" :  "30px"
    },
    childrenIds: ["component_id_text_input"]
  },
  {
    uuid: "component_id_text_label",
    name: "value text label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    style: {
      ...InputTextLabelTheme
    },
    input: {
      value: {
        type: "string",
        value: 'ID'
      }
    }
  },
  {
    uuid: "component_id_text_input",
    name: "value text input",
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
            updateInput(selectedComponent, "id", 'string',EventData.value);

        }
      `
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
        return Utils.first(Vars.selectedComponents)?.input?.id?.value ?? ""
        `
      },
      state: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          return selectedComponent?.input?.value?.type === "handler" &&
            selectedComponent?.input?.value?.value
            ? "disabled"
            : "unabled";
        `
      },
      placeholder: {
        type: "string",
        value: "id"
      }
    }
  },
  {
    uuid: "component_id_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "value handler",
    style: {
      display: "block"
    },
    input: {
      id: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Vars.selectedComponents);
          const handlerValue = selectedComponent?.input?.value?.type === 'handler'
            ? selectedComponent?.input?.value.value
            : '';
          return ['id', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Vars.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.value?.value) {
          updateInput(selectedComponent, 'id', 'handler', EventData.value);
        }
      `
    }
  }
];