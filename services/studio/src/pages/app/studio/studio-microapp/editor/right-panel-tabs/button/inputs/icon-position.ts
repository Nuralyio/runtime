import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "button_icon_position_block",
    application_id: "1",
    name: "button icon position block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["icon_position_radio_block", "icon_position_handler_block"]
  },
  {
    uuid: "icon_position_radio_block",
    application_id: "1",
    name: "icon position radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["icon_position_label"]
  },
  {
    uuid: "icon_position_label",
    name: "icon position label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Icon position'
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "icon_position_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon position radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const isDisabled = selectedComponent?.input?.iconPosition?.type === 'handler' &&
            selectedComponent?.input?.iconPosition?.value;
          
          const currentIconPosition = isDisabled 
            ? ''
            : selectedComponent?.input?.iconPosition?.value || 'left';

          return [
            [
              { label: "Left", value: "left", disabled: isDisabled },
              { label: "Right", value: "right", disabled: isDisabled }
            ],
            currentIconPosition,
            'button'
          ];
        `
      }
    },
    style: {
      ...RadioButtonWithTwoOptionsTheme
    },
    event: {
      changed: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent) {
          updateInput(selectedComponent, 'iconPosition', 'value', EventData.value);
        }
      `
    }
  },
  {
    uuid: "icon_position_handler_block",
    application_id: "1",
    name: "icon position handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      "margin-top": "10px",
      display: "flex",
      "justify-content": "space-between"
    },
    childrenIds: ["icon_position_radio", "icon_position_handler"]
  },
  {
    uuid: "icon_position_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "icon position handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
          const selectedComponent = Utils.first(Editor.selectedComponents);
          const handlerValue = selectedComponent?.input?.iconPosition?.type === 'handler'
            ? selectedComponent.input.iconPosition.value
            : '';
          return ['iconPosition', handlerValue];
        `
      }
    },
    event: {
      codeChange: /* js */ `
        const selectedComponent = Utils.first(Editor.selectedComponents);
        if (selectedComponent && EventData.value !== selectedComponent?.input?.iconPosition?.value) {
          updateInput(selectedComponent, 'iconPosition', 'handler', EventData.value);
        }
      `
    }
  }
];