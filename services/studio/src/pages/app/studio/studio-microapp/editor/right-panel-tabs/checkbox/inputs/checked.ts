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
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentCheck=""
                let isDisabled=false;
                if(currentComponent?.input?.checked?.type =='handler' && currentComponent.input?.checked?.value)
                { 
                    isDisabled=true
                }
                else 
                currentCheck = currentComponent.input?.checked?.value || 'uncheck';
                const options = 
                    [
                    {
                    icon: "check",
                    value: "check",
                    disabled:isDisabled
                    }, 
                    {
                    icon: "xmark",
                    value: "uncheck",
                    disabled:isDisabled
                    },
                    {
                    icon:'bars',
                    value:'indeterminate',
                    disabled:isDisabled
                    }
            ]   
            const radioType ='button'
            const result = [options,currentCheck,radioType];
           return  result;
                `
      }
    },
    style: {
      ...RadioButtonWithThreeOptionsTheme
    },
    event: {
      changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const checkedValue = EventData.value;
                    updateInput(currentComponent,'checked','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
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
                let checkboxHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.checked?.type =='handler' && currentComponent?.input?.checked?.value){
                            checkboxHandler = currentComponent?.input?.checked?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,checkboxHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    if(EventData.value != currentComponent?.input?.checked?.value)
                    updateInput(currentComponent,'checked','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];