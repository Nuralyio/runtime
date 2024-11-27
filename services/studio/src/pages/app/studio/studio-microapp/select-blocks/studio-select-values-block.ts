import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
    {
        uuid: "select_values_handler_block",
        applicationId: "1",
        name: "value handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "310px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["select_values_label","select_values_handler"],
    },
    {
        uuid: "select_values_label",
        name: "select values label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
          width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Data';
               return label;
            `
            }
        },
    },
    {
        uuid: "select_values_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "value handler",
        style: {
                display:'block',
                width: "50px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='value';
                let valueHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.options?.type =='handler' && currentComponent?.input?.options?.value){
                           valueHandler = currentComponent?.input?.options?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,valueHandler];
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
                    if(EventData.value != currentComponent?.input?.value?.value != EventData.value )
                    updateInput(currentComponent,'options','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]