import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../../../utils/common-editor-theme.ts";

export const StatusInputBlock = [
  {
    uuid: "component_status_block",
    applicationId: "1",
    name: "status block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["component_status_radios_block", "component_status_handler_block"]
  },
  {
    uuid: "component_status_radios_block",
    applicationId: "1",
    name: "status input block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["component_status_label"]
  },
  {
    uuid: "component_status_label",
    name: "status label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
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
    uuid: "component_status_radio",
    applicationId: "1",
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
          let currentStatus = '';
          if (selectedComponent.input && selectedComponent?.input?.status?.type == "handler" &&
            selectedComponent.input && selectedComponent?.input?.status?.value != "") {
            isDisabled = true;
          } else {
            currentStatus = selectedComponent.input && selectedComponent?.input?.status?.value || 'default';
          }

          const options = [
            { value: "default", icon: 'font-awesome', disabled: isDisabled },
            { value: "warning", icon: 'triangle-exclamation', disabled: isDisabled },
            { value: "error", icon: 'circle-exclamation', disabled: isDisabled }
          ];

          const radioType = 'button';
          const result = [options, currentStatus, radioType];
          return result;
        `
      }
    },
    event: {
      changed: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        const statusValue = EventData.value ? EventData.value : 'default';
        updateInput(selectedComponent, 'status', 'string', statusValue);
      `
    }
  },
  {
    uuid: "component_status_handler_block",
    applicationId: "1",
    name: "status handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["component_status_radio", "component_status_handler"]
  },
  {
    uuid: "component_status_handler",
    applicationId: "1",
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
          const parameter = 'status';
          let statusHandler = '';
          const selectedComponent = Utils.first(Editor.selectedComponents);
          if (selectedComponent?.input && selectedComponent?.input.status?.type == "handler") {
            statusHandler = selectedComponent?.input && selectedComponent?.input.status?.value || '';
          }
          return [parameter, statusHandler];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        updateInput(Utils.first(Editor.selectedComponents), 'status', 'handler', EventData.value);
      `
    }
  }
];