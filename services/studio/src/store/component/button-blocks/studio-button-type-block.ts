import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_type_block",
        applicationId: "1",
        name: "button type block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["button_type_label", "button_type_select","button_type_handler_block"],
    },
    
    {
        uuid: "button_type_label",
        name: "button type label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const typeLabel='Type';
                typeLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "button_type_select",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "button type select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled = false;
                let currentType =''
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers?.type) {
                    isDisabled = true
                }
                else
                currentType = currentComponent?.style &&currentComponent.style['type'] || 'default'
                const options = 
                    [
                    {
                    label: "Primary",
                    value: "primary",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Secondary",
                    value: "secondary",
                    disabled:isDisabled

                   },
                    {
                     label: "Danger",
                     value: "danger",
                     disabled:isDisabled
                   },
                   {
                    label: "Ghost",
                    value: "ghost",
                    disabled:isDisabled
                   },
                   {
                    label: "Default",
                    value: "default",
                    disabled:isDisabled
                   },
            ]   
            const radioType ='button'
            const result = [options,currentType,radioType];
           return  result;
                `
            }
        },
        style: {
            display:'block',
            width: "350px",
        },
        event: {
            changed: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const typeValue = EventData.value;
                    updateStyle(currentComponent,'type',typeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "button_type_handler_block",
        applicationId: "1",
        name: "button type handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["button_type_handler"],
    },
    {
        uuid: "button_type_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "type  handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='type';
                let typeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    typeHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['type'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,typeHandler];
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
                    updateStyleHandlers(currentComponent,'type',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]