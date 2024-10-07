import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "checkbox_checked_block",
        applicationId: "1",
        name: "checkbox checked block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["checkbox_checked_label", "checkbox_checked_radio","checkbox_handler_block"],
    },
    
    {
        uuid: "checkbox_checked_label",
        name: "checkbox checked label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const checkedLabel='Checked';
                checkedLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "checkbox_checked_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "checkbox checked radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentCheck=""
                let isDisabled=false;
                if(currentComponent.input?.checked.type =='handler' && currentComponent.input?.checked?.value)
                { 
                    isDisabled=true
                }
                else 
                currentCheck = currentComponent.input?.checked?.value || 'uncheck';
                const options = 
                    [
                    {
                    icon: "check",
                    value: "check",
                    disabled:isDisabled
                    }, 
                    {
                    icon: "xmark",
                    value: "uncheck",
                    disabled:isDisabled
                    },
                    {
                    icon:'bars',
                    value:'indeterminate',
                    disabled:isDisabled
                    }
            ]   
            const radioType ='button'
            const result = [options,currentCheck,radioType];
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
                    const checkedValue = EventData.value;
                    updateInput(currentComponent,'checked','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "checkbox_handler_block",
        applicationId: "1",
        name: "checkbox handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["checkbox_handler"],
    },
    {
        uuid: "checkbox_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "checkbox handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='checkbox';
                let checkboxHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.checked?.type =='handler' && currentComponent?.input?.checked?.value){
                            checkboxHandler = currentComponent?.input?.checked?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,checkboxHandler];
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
                    if(EventData.value != currentComponent?.input?.checked?.value)
                    updateInput(currentComponent,'checked','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]