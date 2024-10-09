import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "image_alt_text_block",
        applicationId: "1",
        name: "image alt text block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
            'flex-direction':'column'
        },

        childrenIds: ["label_image_alt", "alt_text_input","alt_handler_block"],
    },
    {
        uuid: "label_image_alt",
        name: "label image alt",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Alt';
             return label;
            `
            }
        },
    },
    {
        uuid: "alt_text_input",
        name: "alt text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            size:"medium",
        },
        event: {
            valueChange:/* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const newAltText = EventData.value;
                        updateInput(currentComponent,'alt','string',newAltText);
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
                if(currentComponent.input?.alt?.type=="value"){
                const currentAlt=currentComponent.input?.alt?.value??'';
                return currentAlt;
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
                if(currentComponent.input?.alt?.type =="handler"&&currentComponent.input?.alt?.value){
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
                const inputPlaceHolder ="alt";
             return  inputPlaceHolder;
            `
            }

        }
    },
    {
        uuid: "alt_handler_block",
        applicationId: "1",
        name: "alt handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "220px",
            'margin-top': '10px',
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["alt_handler"],
    },
    {
        uuid: "alt_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "alt handler",
        style: {
                display:'block',
                width: "250px", 
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='alt';
                let altHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.alt?.type =='handler' && currentComponent?.input?.alt?.value){
                           altHandler = currentComponent?.input?.alt?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,altHandler];
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
                    if(EventData.value != currentComponent?.input?.alt?.value != EventData.value )
                    updateInput(currentComponent,'alt','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]