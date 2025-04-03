import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme } from "../../../utils/common-editor-theme.ts";

export default [
  {
    uuid: "table_values_handler_block",
    application_id: "1",
    name: "value handler block",
    component_type: ComponentType.Container,
    ...COMMON_ATTRIBUTES,
    style: {
      ...InputBlockContainerTheme
    },

    childrenIds: ["table_values_handler_label", "table_values_handler"]
  },
  {
    uuid: "table_values_handler_label",
    name: "table values handler label",
    component_type: ComponentType.TextLabel,
    application_id: "1",
    ...COMMON_ATTRIBUTES,
    input: {
      value: {
        type: "handler",
        value: /* js */`
               const label ='Data';
               return label;
            `
      }
    }
  },
  {
    uuid: "table_values_handler",
    application_id: "1",
    component_type: ComponentType.Event,
    ...COMMON_ATTRIBUTES,
    styleHandlers: {},
    name: "table value handler",
    style: {
      display: "block"
    },
    input: {
      value: {
        type: "handler",
        value: /* js */`
                const parameter ='value';
                let valueHandler=''
                
                    const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                        
                        
                        if(selectedComponent.input?.data?.value){
                           valueHandler = selectedComponent.input?.data?.value
                        }
                
                return [parameter,valueHandler];
            `
      }
    },

    event: {
      codeChange: /* js */ `
            
                const selectedComponent = Utils.first(Vars.selectedComponents);
                    
                    
                    if(selectedComponent.input?.value?.value != EventData.value )
                    updateInput(selectedComponent,'data','handler',EventData.value);
            
      `
    }
  }

];