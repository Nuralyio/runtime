import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "size_block",
        applicationId: "1",
        name: "size block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["size_label", "size_radio","size_handler_block"],
    },
    
    {
        uuid: "size_label",
        name: "size label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Size';
             return label;
            `
            }
        },
        style: {

        }
    },
    {
        uuid: "size_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "size select",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled = false;
                let currentSize =''
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers?.size) {
                    isDisabled = true
                }
                else
                currentSize = currentComponent.style && currentComponent.style['size'] || 'medium'
                const options = 
                    [
                        {   label:'Small',
                            value: "small",
                            disabled:isDisabled
                        },
                        {   label:'Medium',
                            value: "medium",
                            disabled:isDisabled

                        },
                        {   label:'Large',
                            value: "large",
                            disabled:isDisabled

                        }
            ]   
            const radioType ='button'
            const result = [options,currentSize,radioType];
           return  result;
                `
            },
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
                    const sizeValue = EventData.value;
                    updateStyle(currentComponent,'size',sizeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "size_handler_block",
        applicationId: "1",
        name: "status handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["size_handler"],
    },
    {
        uuid: "size_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "size handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='size';
                let sizeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    sizeHandler = currentComponent?.styleHandlers && currentComponent?.styleHandlers['size'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,sizeHandler];
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
                    updateStyleHandlers(currentComponent,'size',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]