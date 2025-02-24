import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../utils/common-editor-theme.ts";

export const StudioButtonStateInput = [
  {
    uuid: "state_block",
    application_id: "1",
    name: "state block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: { ...InputBlockContainerTheme },
    childrenIds: ["state_radio_block", "state_handler_block"]
  },
  {
    uuid: "state_radio_block",
    application_id: "1",
    name: "state radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["state_label"]
  },
  {
    uuid: "state_label",
    name: "state label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: { type: "string", value: 'State' }
    },
    style: { width: "90px" }
  },
  {
    uuid: "state_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "state radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
          try {
            const selectedComponent = Utils.first(Editor.selectedComponents);
            if (!selectedComponent) return [[], '', 'button'];
            const Input = selectedComponent ? Editor.getComponentBreakpointInput(selectedComponent, 'state')?.value : null;
            console.log(Input)
            const isDisabled = selectedComponent?.input?.state?.type === 'handler';
            const currentState = isDisabled ? '' : (Input || 'enabled');
            
            return [
              [
                { label: "Enabled", value: "enabled", disabled: isDisabled },
                { label: "Disabled", value: "disabled", disabled: isDisabled }
              ],
              currentState,
              'button'
            ];
          } catch(error) {
            console.error(error);
            return [[], '', 'button'];
          }`
      }
    },
    style: { ...RadioButtonWithTwoOptionsTheme },
    event: {
      changed: /* js */ `
            updateInput(Utils.first(Editor.selectedComponents), 'state', 'value', EventData.value);
          `
    }
  },
  {
    uuid: "state_handler_block",
    application_id: "1",
    name: "state handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["state_radio", "state_handler"]
  },
  {
    uuid: "state_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "state handler",
    style: { display: "block", width: "50px" },
    input: {
      value: {
        type: "handler",
        value: /* js */`
            const selectedComponent = Utils.first(Editor.selectedComponents);
            const stateHandler = selectedComponent?.input?.state?.type === 'handler' 
              ? selectedComponent.input.state.value 
              : '';
            return ['state', stateHandler];
         `
      }
    },
    event: {
      codeChange: /* js */ `
          updateInput(Utils.first(Editor.selectedComponents), 'state', 'handler', EventData.value);
        `
    }
  }
];