import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "display_block",
        applicationId: "1",
        name: "display block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },
        childrenIds: ["display_label", "display_radio","display_handler_block"],
    },
    
    {
        uuid: "display_label",
        name: "display label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const displayLabel='Display';
                displayLabel;
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "display_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "display radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentDisplay=""
                let isDisabled=false;
                if(currentComponent.input?.display?.type =='handler' && currentComponent.input?.display?.value)
                {
                  isDisabled = true;
                }
                else
                currentDisplay = currentComponent.input?.display?.value || 'show';
                const options = 
                    [
                    {
                    icon: "eye",
                    value: "show",
                    disabled:isDisabled
                    }, 
                    {
                    icon: "eye-slash",
                    value: "none",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentDisplay,radioType];
            result;
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
                    const displayValue = EventData.value;
                    updateInput(currentComponent,'display','string',displayValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "display_handler_block",
        applicationId: "1",
        name: "display handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["display_handler"],
    },
    {
        uuid: "display_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "display handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='display';
                let displayHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.display?.type =='handler' && currentComponent?.input?.display?.value){
                            displayHandler = currentComponent?.input?.display?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,displayHandler];
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
                    if(EventData.value != currentComponent?.input?.display?.value)
                    updateInput(currentComponent,'display','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },


]