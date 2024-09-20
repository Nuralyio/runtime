import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "table_filter_block",
        applicationId: "1",
        name: "table filter block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["table_filter_label", "table_filter_radio","table_filter_handler_block"],
    },
    
    {
        uuid: "table_filter_label",
        name: "table filter label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input:{
            value:{
                type:'handler',
                value:/* js */`
                const filterLabel='Filter';
                filterLabel;
                
                `
            }
        },
        style: {

        }
    },
    {
        uuid: "table_filter_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "table filter radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentFilter="";
                let isDisabled =false;
                if(currentComponent.input?.filter?.type =="handler" && currentComponent.input?.filter?.value){
                    isDisabled =true
                }
                else 
                currentFilter = currentComponent.input?.filter?.value || 'none';
                const options = 
                    [
                    {
                    icon: "filter",
                    value: "filter",
                    disabled:isDisabled
                    }, 
                    {
                    icon: "xmark",
                    value: "none",
                    disabled:isDisabled
                   }
            ]   
            const radioType ='button'
            const result = [options,currentFilter,radioType];
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
                    const filterValue = EventData.value;
                    updateInput(currentComponent,'filter','string',EventData.value)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "table_filter_handler_block",
        applicationId: "1",
        name: "table filter handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["table_filter_handler"],
    },
    {
        uuid: "table_filter_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "filter handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='filter';
                let filterHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.filter?.type =='handler' && currentComponent?.input?.filter?.value){
                            filterHandler = currentComponent?.input?.filter?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                [parameter,filterHandler];
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
                    if(EventData.value != currentComponent?.input?.filter?.value)
                    updateInput(currentComponent,'filter','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]