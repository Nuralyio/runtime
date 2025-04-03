import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "select_selection_mode_block",
    application_id: "1",
    name: "select selection mode block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["select_selectionmode_radio_block", "selectionmode_handler_block"]
  },
  {
    uuid: "select_selectionmode_radio_block",
    application_id: "1",
    name: "select radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["select_selectionmode_label"]
  },

  {
    uuid: "select_selectionmode_label",
    name: "select selection mode label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value:/* js */`
                const selectionModeLabel='Selection mode';
                return selectionModeLabel;
                
                `
      }
    },
    style: {
      width: "90px;"

    }
  },
  {
    uuid: "select_selectionmode_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "select selection mode radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let currentSelectionMode=""
                let isDisabled =false;
                if(selectedComponent.input?.selectionMode?.type=="handler" && selectedComponent.input?.selectionMode?.value)
                {
                     isDisabled=true
                }
                else 
                    currentSelectionMode = selectedComponent.input?.selectionMode?.value || 'single';
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
                   }
            ]   
            const radioType ='button'
            const result = [options,currentSelectionMode,radioType];
           return  result;
                `
      }
    },
    style: {
      ...RadioButtonWithTwoOptionsTheme
    },
    event: {
      changed: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                    
                    
                    const selectionModeValue = EventData.value;
                    updateInput(selectedComponent,'selectionMode','string',EventData.value)
              
      `
    }
  },

  {
    uuid: "selectionmode_handler_block",
    application_id: "1",
    name: "selectionmode handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "justify-content": "space-between"
    },

    childrenIds: ["select_selectionmode_radio", "selectionmode_handler"]
  },
  {
    uuid: "selectionmode_handler",
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
                const parameter ='selectionmode';
                let selectionModeHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.input?.selectionMode?.type =='handler' && selectedComponent.input?.selectionMode?.value){
                            selectionModeHandler= selectedComponent.input?.selectionMode?.value
                        }
                
                return [parameter,selectionModeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.selectionMode?.value)
                    updateInput(selectedComponent,'selectionMode','handler',EventData.value);
            
      `
    }
  }


];