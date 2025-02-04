import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "select_type_block",
    application_id: "1",
    name: "select type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["select_radio_block", "type_handler_block"]
  },
  {
    uuid: "select_radio_block",
    application_id: "1",
    name: "placeholder block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["select_type_label"]
  },

  {
    uuid: "select_type_label",
    name: "select type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const typeLabel='Type';
                return typeLabel;
                
                `
      }
    },
    style: {
      width: "90px"

    }
  },
  {
    uuid: "select_type_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "select type radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentType=""
                let isDisabled=false;
                if(currentComponent.input?.type?.type =='handler'&&currentComponent.input?.type?.value){
                    isDisabled =true
                }
                else 
                currentType = currentComponent.input?.type?.value || 'default';
                const options = 
                    [
                    {
                    label: "Default",
                    value: "default",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Inline",
                    value: "inline",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentType,radioType];
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
                    const typeValue = EventData.value;
                    updateInput(currentComponent,'type','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "type_handler_block",
    application_id: "1",
    name: "type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["select_type_radio", "type_handler"]
  },
  {
    uuid: "type_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "type handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='type';
                let typeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.type?.type =='handler' && currentComponent?.input?.type?.value){
                            typeHandler = currentComponent?.input?.type?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,typeHandler];
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
                    if(EventData.value != currentComponent?.input?.type?.value)
                    updateInput(currentComponent,'type','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];