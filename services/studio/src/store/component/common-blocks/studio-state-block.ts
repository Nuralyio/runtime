import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "state_block",
        applicationId: "1",
        name: "state block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["state_label", "state_radio","state_handler_block"],
    },
    
    {
        uuid: "state_label",
        name: "state label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const stateLabel='State';
                stateLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "state_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "state radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled=false
                let currentState=''
                 if(currentComponent.input?.state?.type=='handler' && currentComponent.input?.state?.value)
                 {   
                    isDisabled=true;
                 }
                 else
                 currentState = currentComponent.input?.state?.value || 'enabled';
                const options = 
                    [
                    {
                    label: "Enabled",
                    value: "enabled",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Disabled",
                    value: "disabled",
                    disabled:isDisabled

                   }
            ]   
            const radioType ='button'
            const result = [options,currentState,radioType];
            console.log('result ',result)
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
                    const stateValue = EventData.value;
                    updateInput(currentComponent,'state','value',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "state_handler_block",
        applicationId: "1",
        name: "state handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["state_handler"],
    },
    {
        uuid: "state_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "state handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='state';
                let stateHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.state?.type =='handler' && currentComponent?.input?.state?.value){
                            stateHandler = currentComponent?.input?.state?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,stateHandler];
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
                    if(EventData.value != currentComponent?.input?.state?.value)
                    updateInput(currentComponent,'state','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]