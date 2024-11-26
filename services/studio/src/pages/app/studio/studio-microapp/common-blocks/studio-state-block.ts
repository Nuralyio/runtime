import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "state_block",
        applicationId: "1",
        name: "state block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between',
            width:'330px',
            "margin-top":'10px'
        },

        childrenIds: ["state_radio_block","state_handler_block"],
    },
    {
        uuid: "state_radio_block",
        applicationId: "1",
        name: "state radio block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["state_label", "state_radio"],
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
                return stateLabel;
                
                `
            }
        },
        style: {
            width:'90px',
            'font-size':'14px'
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
            width: "50px",
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
                return [parameter,stateHandler];
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