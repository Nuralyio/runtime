import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "status_block",
        applicationId: "1",
        name: "status block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: { 
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["status_label", "status_radio","status_handler_block"],
    },
    
    {
        uuid: "status_label",
        name: "status label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Status';
             return label;
            `
            }
        },
        style: {

        }
    },
    {
        uuid: "status_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "status radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled = false;
                let currentState =''
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers?.state) {
                    isDisabled = true
                }
                else
                currentState = currentComponent.style && currentComponent.style['state'] || 'default'
                
                const options = 
                [
                    {
                        value: "default",
                        icon:'font-awesome',
                        disabled:isDisabled
                    }, 
                    {
                        value: "warning",
                        icon:'triangle-exclamation',
                        disabled:isDisabled
                    },
                    {
                        value: "error",
                        icon:'circle-exclamation',
                        disabled:isDisabled
                    }
                ]  
            const radioType='button' 
            const result =[options,currentState,radioType];
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
                    const stateValue = EventData.value?EventData.value:'default';
                    updateStyle(currentComponent,'state',stateValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "status_handler_block",
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
        
        childrenIds: ["status_handler"],
    },
    {
        uuid: "status_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "status handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='status';
                let statusHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    statusHandler =currentComponent?.styleHandlers && currentComponent?.styleHandlers['state'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,statusHandler];
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
                    updateStyleHandlers(currentComponent,'state',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]