import { COMMON_ATTRIBUTES } from "../../../../core/helpers/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../../../../core/utils/common-editor-theme.ts";

export default [
  {
    uuid: "table_selection_mode",
    application_id: "1",
    name: "table selection mode block",
    component_type: "vertical-container-block",
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
    component_type: "vertical-container-block",
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
    component_type: "text_label",
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
    component_type: "RadioButton",
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "selection mode radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
        const selectedComponent = Utils.first(Vars.selectedComponents);

                let currentSelectionMode =""
                let isDisabled=false;
                if(selectedComponent.input?.selectionMode?.type =='handler'&&selectedComponent.input?.selectionMode?.value){
                       isDisabled =true
                }
                else 
                currentSelectionMode = selectedComponent.input?.selectionMode?.value || 'none';
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
            
              const selectedComponent = Utils.first(Vars.selectedComponents);
                    const selectionModeValue = EventData.value;
                    updateInput(selectedComponent,'selectionMode','string',EventData.value)
              
      `
    }
  },
  {
    uuid: "table_selectionmode_handler_block",
    application_id: "1",
    name: "table selection mode handler block",
    component_type: "vertical-container-block",
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["table_selectionmode_radio", "table_selectionmode_handler"]
  },
  {
    uuid: "table_selectionmode_handler",
    application_id: "1",
    component_type: "event",
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
                  const selectedComponent = Utils.first(Vars.selectedComponents);
                        if(selectedComponent?.input?.selectionMode?.type =='handler' && selectedComponent?.input?.selectionMode?.value){
                            selectionModeHandler = selectedComponent?.input?.selectionMode?.value
                        }
               return  [parameter,selectionModeHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
              const selectedComponent = Utils.first(Vars.selectedComponents);
                    if(EventData.value != selectedComponent?.input?.selectionMode?.value)
                    updateInput(selectedComponent,'selectionMode','handler',EventData.value);
      `
    }
  }

];