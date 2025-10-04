import { ComponentType } from "@shared/redux/store/component/component.interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../core/helpers/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithTwoOptionsTheme } from "../../../../core/utils/common-editor-theme.ts";

export default [
  {
    uuid: "table_filter_block",
    application_id: "1",
    name: "table filter block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["table_filter_radio_block", "table_filter_handler_block"]
  },
  {
    uuid: "table_filter_radio_block",
    application_id: "1",
    name: "table filter radio block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      display: "flex",
      "align-items": "center",
      "justify-content": "space-between"
    },
    childrenIds: ["table_filter_label"]
  },

  {
    uuid: "table_filter_label",
    name: "table filter label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "string",
        value:'Filter'
      }
    },
    style: {
      width: "90px"
    }
  },
  {
    uuid: "table_filter_radio",
    application_id: "1",
    component_type: ComponentType.RadioButton,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "table filter radio",
    input: {
      value: {
        type: "handler",
        value: /* js */ ` 
                const selectedComponent = Utils.first(Vars.selectedComponents);
                
                
                let currentFilter="";
                let isDisabled =false;
                if(selectedComponent.input?.filter?.type =="handler" && selectedComponent.input?.filter?.value){
                    isDisabled =true
                }
                else 
                currentFilter = selectedComponent.input?.filter?.value || 'none';
                const options = 
                    [
                    {
                    icon: "filter",
                    value: "filter",
                    disabled:isDisabled
                    }, 
                    {
                    icon: "xmark",
                    value: "none",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentFilter,radioType];
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
                    
                    
                    const filterValue = EventData.value;
                    updateInput(selectedComponent,'filter','string',EventData.value)
              
      `
    }
  },
  {
    uuid: "table_filter_handler_block",
    application_id: "1",
    name: "table filter handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {},

    childrenIds: ["table_filter_radio", "table_filter_handler"]
  },
  {
    uuid: "table_filter_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "filter handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='filter';
                let filterHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                        
                        
                        if(selectedComponent.input?.filter?.type =='handler' && selectedComponent.input?.filter?.value){
                            filterHandler = selectedComponent.input?.filter?.value
                        }
                
                return [parameter,filterHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(EventData.value != selectedComponent.input?.filter?.value)
                    updateInput(selectedComponent,'filter','handler',EventData.value);
            
      `
    }
  }

];