import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "table_selectionmode_block",
        applicationId: "1",
        name: "table selection mode block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["table_selectionmode_label", "table_selectionmode_radio","table_selectionmode_handler_block"],
    },
    
    {
        uuid: "table_selectionmode_label",
        name: "table selection mode label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const selectionModeLabel='Selection mode';
                selectionModeLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "table_selectionmode_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "selection mode radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentSelectionMode =""
                let isDisabled=false;
                if(currentComponent.input?.selectionMode?.type =='handler'&&currentComponent.input?.selectionMode?.value){
                       isDisabled =true
                }
                else 
                currentSelectionMode = currentComponent.input?.selectionMode?.value || 'none';
                const options = 
                    [
                    {
                    label: "Single",
                    value: "single",
                    disabled:isDisabled
                    }, 
                    {
                    label: "Multiple",
                    value: "multiple",
                    disabled:isDisabled
                    },
                    {
                     label:'None',
                     value:'none',
                     disabled:isDisabled
                    }
            ]   
            const radioType ='button'
            const result = [options,currentSelectionMode,radioType];
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
                    const selectionModeValue = EventData.value;
                    updateInput(currentComponent,'selectionMode','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "table_selectionmode_handler_block",
        applicationId: "1",
        name: "table selection mode handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["table_selectionmode_handler"],
    },
    {
        uuid: "table_selectionmode_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "selection mode handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='selectionMode';
                let selectionModeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.selectionMode?.type =='handler' && currentComponent?.input?.selectionMode?.value){
                            selectionModeHandler = currentComponent?.input?.selectionMode?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,selectionModeHandler];
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
                    if(EventData.value != currentComponent?.input?.selectionMode?.value)
                    updateInput(currentComponent,'selectionMode','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]