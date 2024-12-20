import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../utils/common-editor-theme.ts";

export const StudioButtonStateInput = [
  {
    uuid: "state_block",
    applicationId: "1",
    name: "state block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["state_radio_block", "state_handler_block"]
  },
  {
    uuid: "state_radio_block",
    applicationId: "1",
    name: "state radio block",
    component_type: ComponentType.VerticalContainer,
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
    applicationId: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const stateLabel='State';
                return stateLabel;
                
                `
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "state_radio",
    applicationId: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "state radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled=false
                let currentState=''
                 if(currentComponent.input?.state?.type=='handler' && currentComponent.input?.state?.value)
                 {   
                    isDisabled=true;
                 }
                 else
                 currentState = currentComponent.input?.state?.value || 'enabled';
                const options = 
                    [
                    {
                    label: "Enabled",
                    value: "enabled",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Disabled",
                    value: "disabled",
                    disabled:isDisabled

                   }
            ]   
            const radioType ='button'
            const result = [options,currentState,radioType];
           return  result;
                `
      }
    },
    style: {
      ...RadioButtonWithTwoOptionsTheme
    },
    event: {
      changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const stateValue = EventData.value;
                    updateInput(currentComponent,'state','value',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "state_handler_block",
    applicationId: "1",
    name: "state handler block",
    component_type: ComponentType.VerticalContainer,
    ...COMMON_ATTRIBUTES,
    style: {

      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["state_radio", "state_handler"]
  },
  {
    uuid: "state_handler",
    applicationId: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "state handler",
    style: {
      display: "block",
      width: "50px"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='state';
                let stateHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.state?.type =='handler' && currentComponent?.input?.state?.value){
                            stateHandler = currentComponent?.input?.state?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,stateHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    if(EventData.value != currentComponent?.input?.state?.value)
                    updateInput(currentComponent,'state','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];