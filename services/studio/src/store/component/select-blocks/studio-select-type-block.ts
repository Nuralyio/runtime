import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "select_type_block",
        applicationId: "1",
        name: "select type block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["select_type_label", "select_type_radio","type_handler_block"],
    },
    
    {
        uuid: "select_type_label",
        name: "select type label",
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
        uuid: "select_type_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select type radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentType=""
                let isDisabled=false;
                if(currentComponent.input?.type?.type =='handler'&&currentComponent.input?.type?.value){
                    isDisabled =true
                }
                else 
                currentType = currentComponent.input?.type?.value || 'default';
                const options = 
                    [
                    {
                    label: "Default",
                    value: "default",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Inline",
                    value: "inline",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentType,radioType];
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
                    const typeValue = EventData.value;
                    updateInput(currentComponent,'type','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "type_handler_block",
        applicationId: "1",
        name: "type handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["type_handler"],
    },
    {
        uuid: "type_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "type handler",
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
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.type?.type =='handler' && currentComponent?.input?.type?.value){
                            typeHandler = currentComponent?.input?.type?.value
                        }
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
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    if(EventData.value != currentComponent?.input?.type?.value)
                    updateInput(currentComponent,'type','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]