import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "select_selectionmode_block",
        applicationId: "1",
        name: "select selection mode block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justify-content':'space-between',
            'align-items':'center',
            width:'330px',
            "margin-top":'10px'
        },

        childrenIds: ["select_selectionmode_radio_block","selectionmode_handler_block"],
    },
    {
        uuid: "select_selectionmode_radio_block",
        applicationId: "1",
        name: "select radio block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["select_selectionmode_label", "select_selectionmode_radio"],
    },
    
    {
        uuid: "select_selectionmode_label",
        name: "select selection mode label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const selectionModeLabel='Selection mode';
                return selectionModeLabel;
                
                `
            }
        },
        style: {
            'font-size':'14px',
            width:'90px;'

        }
    },
    {
        uuid: "select_selectionmode_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "select selection mode radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentSelectionMode=""
                let isDisabled =false;
                if(currentComponent.input?.selectionMode?.type=="handler" && currentComponent.input?.selectionMode?.value)
                {
                     isDisabled=true
                }
                else 
                    currentSelectionMode = currentComponent.input?.selectionMode?.value || 'single';
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
                   }
            ]   
            const radioType ='button'
            const result = [options,currentSelectionMode,radioType];
           return  result;
                `
            }
        },
        style: {
            display:'block',
            '--hybrid-button-height':'30px',
            '--hybrid-button-width':'50px',
            '--hybrid-button-font-size':'12px'
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
        uuid: "selectionmode_handler_block",
        applicationId: "1",
        name: "selectionmode handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["selectionmode_handler"],
    },
    {
        uuid: "selectionmode_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "selection mode handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='selectionmode';
                let selectionModeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.selectionMode?.type =='handler' && currentComponent?.input?.selectionMode?.value){
                            selectionModeHandler= currentComponent?.input?.selectionMode?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,selectionModeHandler];
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