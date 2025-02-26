import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../editor/utils/common-editor-theme.ts";

export default [
  {
    uuid: "status_block",
    application_id: "1",
    name: "status block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["status_radios_block", "status_handler_block"]
  },
  {
    uuid: "status_radios_block",
    application_id: "1",
    name: "status input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["status_label"]
  },
  {
    uuid: "status_label",
    name: "status label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Status'
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "status_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    style: {
      ...RadioButtonWithThreeOptionsTheme
    },
    styleHandlers: {},
    name: "status radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);
          let isDisabled = false;
          let currentState = '';
          if (selectedComponent?.styleHandlers && selectedComponent?.styleHandlers?.state) {
            isDisabled = true;
          } else {
            currentState = Editor.getComponentStyle(selectedComponent, 'state') || 'default';
          }

          const options = [
            {
              value: "default",
              icon: 'font-awesome',
              disabled: isDisabled
            }, 
            {
              value: "warning",
              icon: 'triangle-exclamation',
              disabled: isDisabled
            },
            {
              value: "error",
              icon: 'circle-exclamation',
              disabled: isDisabled
            }
          ];

          const radioType = 'button';
          const result = [options, currentState, radioType];
          return result;
        `
      }
    },
    event: {
      changed: /* js */ `
        updateStyle(Utils.first(Editor.selectedComponents), 'state', EventData.value ?? 'default');
      `
    }
  },
  {
    uuid: "status_handler_block",
    application_id: "1",
    name: "status handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["status_radio", "status_handler"]
  },
  {
    uuid: "status_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "status handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */ `
          const selectedComponent = Utils.first(Editor.selectedComponents);

          const parameter = 'status';
          const statusHandler = selectedComponent?.styleHandlers?.['state'] || '';
          
          return [parameter, statusHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        updateStyleHandlers(Utils.first(Editor.selectedComponents), 'state', EventData.value);
      `
    }
  }
];