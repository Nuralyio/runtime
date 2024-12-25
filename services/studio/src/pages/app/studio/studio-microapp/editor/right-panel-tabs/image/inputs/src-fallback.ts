import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../../utils/common-editor-theme.ts";
export default [
    {
        uuid: "image_fallback_text_block",
        applicationId: "1",
        name: "image fallback text block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
           ...InputBlockContainerTheme
        },

        childrenIds: ["image_fallback_input_block","fallback_handler_block"],
    },
    {
        uuid: "image_fallback_input_block",
        applicationId: "1",
        name: "image fallback block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["label_image_fallback"],
    },
    {
        uuid: "label_image_fallback",
        name: "label image fallback",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        style:{
           width:'90px'
        },
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Fallback';
             return label;
            `
            }
        },
    },
    {
        uuid: "fallback_text_input",
        name: "fallback text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        ...COMMON_ATTRIBUTES,
        style: {
            ...TextInputTheme
        },
        event: {
            valueChange:/* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const newFallBack = EventData.value;
                        updateInput(currentComponent,'fallback','string',newFallBack);
                    }
                }catch(error){
                    console.log(error);
                } 
  `    
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
                if(currentComponent.input?.fallback?.type=="string"){
                const currentFallback=  currentComponent.input?.fallback?.value??'';
                currentFallback;
                }
            }

        }catch(e){
            console.log(e);
        }
            `
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
                if(currentComponent.input?.fallback?.type =="handler"&&currentComponent.input?.fallback?.value){
                   state = "disabled"
               }
               return state;
            }

        }catch(e){
            console.log(e);
        }
            `, 
            },
            placeholder: {
                type: 'handler',
                value: /* js */`
                const inputPlaceHolder ="fallback";
             return  inputPlaceHolder;
            `
            }
        }
    },
    {
        uuid: "fallback_handler_block",
        applicationId: "1",
        name: "fallback handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
        },
        
        childrenIds: ["fallback_text_input","fallback_handler"],
    },
    {
        uuid: "fallback_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "fallback handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='fallback';
                let fallbackHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.fallback?.type =='handler' && currentComponent?.input?.fallback?.value){
                           fallbackHandler = currentComponent?.input?.fallback?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,fallbackHandler];
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
                    if(EventData.value != currentComponent?.input?.fallback?.value != EventData.value )
                    updateInput(currentComponent,'fallback','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]