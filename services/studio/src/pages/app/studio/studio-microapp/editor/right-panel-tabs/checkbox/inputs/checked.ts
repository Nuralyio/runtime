import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "checkbox_checked_block",
    applicationId: "1",
    name: "checkbox checked block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["checkbox_checked_radio_block", "checkbox_handler_block"]
  },
  {
    uuid: "checkbox_checked_radio_block",
    applicationId: "1",
    name: "checkbox checked radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["checkbox_checked_label"]
  },
  {
    uuid: "checkbox_checked_label",
    name: "checkbox checked label",
    component_type: ComponentType.TextLabel,
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const checkedLabel='Checked';
                return checkedLabel;
                `
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "checkbox_checked_radio",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "checkbox checked radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponent = Utils.first(Editor.selectedComponents);
                let currentCheck="";
                let isDisabled=false;
                if(selectedComponent?.input?.checked?.type =='handler' && selectedComponent.input?.checked?.value) { 
                    isDisabled=true;
                } else {
                    currentCheck = selectedComponent.input?.checked?.value || 'uncheck';
                }
                const options = [
                    { icon: "check", value: "check", disabled: isDisabled }, 
                    { icon: "xmark", value: "uncheck", disabled: isDisabled },
                    { icon:'bars', value:'indeterminate', disabled: isDisabled }
                ];
                const radioType ='button';
                return [options, currentCheck, radioType];
                `
      }
    },
    style: {
      ...RadioButtonWithThreeOptionsTheme
    },
    event: {
      changed: /* js */ `
                const selectedComponent = Utils.first(Editor.selectedComponents);
                    const checkedValue = EventData.value;
                    updateInput(selectedComponent, 'checked', 'string', checkedValue);
      `
    }
  },
  {
    uuid: "checkbox_handler_block",
    applicationId: "1",
    name: "checkbox handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},
    childrenIds: ["checkbox_checked_radio", "checkbox_handler"]
  },
  {
    uuid: "checkbox_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "checkbox handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='checkbox';
                let checkboxHandler='';
                const selectedComponent = Utils.first(Editor.selectedComponents);
                if(selectedComponent?.input?.checked?.type =='handler' && selectedComponent?.input?.checked?.value) {
                    checkboxHandler = selectedComponent?.input?.checked?.value;
                }
                return [parameter, checkboxHandler];
            `
      }
    },
    event: {
      codeChange: /* js */ `
                const selectedComponent = Utils.first(Editor.selectedComponents);
                if(selectedComponent && EventData.value != selectedComponent?.input?.checked?.value) {
                    updateInput(selectedComponent, 'checked', 'handler', EventData.value);
                }
      `
    }
  }
];