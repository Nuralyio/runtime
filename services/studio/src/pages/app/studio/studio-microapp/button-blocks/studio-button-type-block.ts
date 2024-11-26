import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "button_type_block",
        applicationId: "1",
        name: "button type block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justif-content':'space-between',
            'align-items':'center',
            width:'330px'
        },

        childrenIds: ["button_type_radio_block","button_type_handler_block"],
    },
    {
        uuid: "button_type_radio_block",
        applicationId: "1",
        name: "placeholder block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["button_type_label", "button_type_select"],
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
                return typeLabel;
                
                `
            }
        },
        style: {
            'font-size':'14px',
            width:'90px'

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
            '--hybrid-button-height':'30px',
            '--hybrid-button-width':'60px',
            '--hybrid-button-font-size':'12px'
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
            width: "50px",
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
                return [parameter,typeHandler];
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