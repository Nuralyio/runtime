import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";

export default [
    {
        uuid: "value_text_block",
        applicationId: "1",
        name: "value text block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
             'align-items':'center',
             "justify-content":'space-between',
             width:'330px',
             "margin-top":'10px'
        },

        childrenIds: ["value_input_block","value_handler_block"],
    },
    {
        uuid: "value_input_block",
        applicationId: "1",
        name: "value input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["value_text_label", "value_text_input"],
    },
    {
        uuid: "value_text_label",
        name: "value text label",
        component_type: ComponentType.TextLabel,
        
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
            'font-size':'14px',
            width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Value';
               return label;
            `
            }
        },
        
    },
    {
        uuid: "value_text_input",
        name: "vlaue text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        ...COMMON_ATTRIBUTES,
        style: {
            width:'120px',
            size:"small",
        },
        event: {
            valueChange:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        updateInput(currentComponent,'value','value',EventData.value);
                    }
                }catch(error){
                    console.log(error);
                }`
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                if(currentComponent.input?.value?.type=="value"){
                   const currentValue=currentComponent.input?.value?.value || [];
                   return currentValue;
               }
               return [];
            }

        }catch(e){
            console.log(e);
        }
            `, 
            
            },
            state: {
                type: 'handler',
                value: /* js */`
            try{
            const selectedComponens =  GetVar( "selectedComponents")||[];
            if(selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)                    
                let state = "unabled";
                if(currentComponent.input?.value?.type =="handler"&&currentComponent.input?.value?.value){
                   state = "disabled"
               }
               return state;
            }

        }catch(e){
            console.log(e);
        }
            `, 
            }
            ,
            placeholder: {
                type: 'handler',
                value: /* js */`
                const inputPlaceHolder ="value";
                return inputPlaceHolder;
            `
            }
        }
    },
    {
        uuid: "value_handler_block",
        applicationId: "1",
        name: "value handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["value_handler"],
    },
    {
        uuid: "value_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "value handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='value';
                let valueHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.value?.type =='handler' && currentComponent?.input?.value?.value){
                           valueHandler = currentComponent?.input?.value?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,valueHandler];
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
                    if(EventData.value != currentComponent?.input?.value?.value)   
                      updateInput(currentComponent,'value','handler',EventData.value);
                
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]