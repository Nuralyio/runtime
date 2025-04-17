import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "input_type_block",
    application_id: "1",
    name: "input type block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },
    childrenIds: ["input_stype_radio_block", "input_type_handler_block"]
  },
  {
    uuid: "input_stype_radio_block",
    application_id: "1",
    name: "input type radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["input_type_label"]
  },

  {
    uuid: "input_type_label",
    name: "input type label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value: 'Type'
      }
    },
    style: {
      width: "90px"

    }
  },
  {
    uuid: "input_type_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "input type radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let currentType="";
                let isDisabled=false;
                if(selectedComponent.input?.type?.type =='handler' && selectedComponent.input?.type?.value){
                    isDisabled = true
                }
                else 
                currentType = selectedComponent.input?.type?.value || 'text'
                const options = 
                [
                    {
                        value: "text",
                        icon:'font',
                        disabled:isDisabled
                    }, 
                    {
                        value: "password",
                        icon:'lock',
                        disabled:isDisabled
                    },
                    {
                        value: "number",
                        icon:'hashtag',
                        disabled:isDisabled
                    }
                ]  
            const radioType='button' 
            const result =[options,currentType,radioType];
           return  result;
                `
      }
    },
    style: {
      ...RadioButtonWithThreeOptionsTheme
    },
    event: {
      changed: /* js */ `

            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    const typeValue = EventData.value?EventData.value:'text';
                    updateInput(selectedComponent,'type','string',typeValue)
              
      `
    }
  },
  {
    uuid: "input_type_handler_block",
    application_id: "1",
    name: "input type handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["input_type_radio","input_type_handler"]
  },
  {
    uuid: "input_type_handler",
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
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.input?.type?.type =='handler' && selectedComponent.input?.type?.value){
                            typeHandler = selectedComponent.input?.type?.value
                        }
                
                return [parameter,typeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.type?.value)
                    updateInput(selectedComponent,'type','handler',EventData.value);
            
      `
    }
  }

];