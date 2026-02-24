import { COMMON_ATTRIBUTES } from "../helpers/common_attributes.ts";
import { InputBlockContainerTheme, InputTextLabelTheme, RadioButtonWithTwoOptionsTheme } from "../utils/common-editor-theme.ts";

export default [
  {
    uuid: "display_block",
    application_id: "1",
    name: "display block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    children_ids: ["display_label", "display_handler_block"]
  },
  {
    uuid: "display_label",
    name: "display label",
    type: "text_label",
    application_id: "1",
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
    application_id: "1",
    type: "radio_button",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "display radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);

          let currentDisplay = "";
          let isDisabled = false;

          if (selectedComponent?.input?.display?.type == 'handler' && !!selectedComponent?.input?.display?.value) {
            isDisabled = true;
          } else {
            currentDisplay = Editor.getComponentBreakpointInput(selectedComponent, 'display')?.value ;
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
      ...RadioButtonWithTwoOptionsTheme
    },
    event: {
      changed: /* js */ `
        updateInput(Utils.first($selectedComponents), 'display', 'string', EventData.value);
      `
    }
  },
  {
    uuid: "display_handler_block",
    application_id: "1",
    name: "icon position handler block",
    type: "container",
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    children_ids: ["display_radio", "display_handler"]
  },
  {
    uuid: "display_handler",
    application_id: "1",
    type: "event",
    ...COMMON_ATTRIBUTES,
    style_handlers: {},
    name: "display handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first($selectedComponents);

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
        const selectedComponent = Utils.first($selectedComponents);
        updateInput(selectedComponent, 'display', 'handler', EventData.value);
      `
    }
  },
  {
    uuid: "display_divider",
    name: "divider",
    type: "divider",
    application_id: "1",
    ...COMMON_ATTRIBUTES
  }
];