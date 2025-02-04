import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "table_selection_mode",
    application_id: "1",
    name: "table selection mode block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["table_selectionmode_radio_block", "table_selectionmode_handler_block"]
  },
  {
    uuid: "table_selectionmode_radio_block",
    application_id: "1",
    name: "table selection mode radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["table_selectionmode_label"]
  },

  {
    uuid: "table_selectionmode_label",
    name: "table selection mode label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value:'Selection mode'
      }
    },
    style: {
      width: "90px"

    }
  },
  {
    uuid: "table_selectionmode_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "selection mode radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentSelectionMode =""
                let isDisabled=false;
                if(currentComponent.input?.selectionMode?.type =='handler'&&currentComponent.input?.selectionMode?.value){
                       isDisabled =true
                }
                else 
                currentSelectionMode = currentComponent.input?.selectionMode?.value || 'none';
                const options = 
                    [
                    {
                    label: "Single",
                    value: "single",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Multiple",
                    value: "multiple",
                    disabled:isDisabled
                    },
                    {
                     label:'None',
                     value:'none',
                     disabled:isDisabled
                    }
            ]   
            const radioType ='button'
            const result = [options,currentSelectionMode,radioType];
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
                    const selectionModeValue = EventData.value;
                    updateInput(currentComponent,'selectionMode','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
    }
  },
  {
    uuid: "table_selectionmode_handler_block",
    application_id: "1",
    name: "table selection mode handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["table_selectionmode_radio", "table_selectionmode_handler"]
  },
  {
    uuid: "table_selectionmode_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "selection mode handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='selectionMode';
                let selectionModeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.selectionMode?.type =='handler' && currentComponent?.input?.selectionMode?.value){
                            selectionModeHandler = currentComponent?.input?.selectionMode?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
               return  [parameter,selectionModeHandler];
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
                    if(EventData.value != currentComponent?.input?.selectionMode?.value)
                    updateInput(currentComponent,'selectionMode','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
    }
  }

];