import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme } from "../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "display_block",
    applicationId: "1",
    name: "display block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["display_label", "display_handler_block"]
  },
  {
    uuid: "display_label",
    name: "display label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Display'
      }
    },
    style: {
      ...InputTextLabelTheme
    }
  },
  {
    uuid: "display_radio",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "display radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);

          let currentDisplay = "";
          let isDisabled = false;

          if (selectedComponent.input?.display?.type == 'handler' && selectedComponent.input?.display?.value) {
            isDisabled = true;
          } else {
            currentDisplay = Editor.getComponentBreakpointInput(selectedComponent, 'display')?.value ?? true;
          }

          const options = [
            {
              icon: "eye",
              value: true,
              disabled: isDisabled
            },
            {
              icon: "eye-slash",
              value: false,
              disabled: isDisabled
            }
          ];

          const radioType = 'button';
          const result = [options, currentDisplay, radioType];

          return result;
        `
      }
    },
    style: {
      display: "block",
      "--hybrid-button-height": "30px",
      "--hybrid-button-width": "76px",
      "--hybrid-button-font-size": "12px"
    },
    event: {
      changed: /* js */ `
        updateInput(Utils.first(Editor.selectedComponents), 'display', 'string', EventData.value);
      `
    }
  },
  {
    uuid: "display_handler_block",
    applicationId: "1",
    name: "icon position handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["display_radio", "display_handler"]
  },
  {
    uuid: "display_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "display handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);

          const parameter = 'display';
          let displayHandler = '';

          if (selectedComponent?.input?.display?.type == 'handler' && selectedComponent?.input?.display?.value) {
            displayHandler = selectedComponent?.input?.display?.value;
          }

          return [parameter, displayHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        updateInput(selectedComponent, 'display', 'handler', EventData.value);
      `
    }
  },
  {
    uuid: "display_divider",
    name: "divider",
    component_type: ComponentType.Divider,
    applicationId: "1",
    ...COMMON_ATTRIBUTES
  }
];