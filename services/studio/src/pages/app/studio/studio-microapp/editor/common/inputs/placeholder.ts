import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../../../helper/common_attributes.ts";
import { InputBlockContainerTheme, TextInputTheme } from "../../utils/common-editor-theme.ts";
export default [
    {
        uuid: "placeholder_text_block",
        applicationId: "1",
        name: "placeholder text block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
             ...InputBlockContainerTheme
        },

        childrenIds: ["placeholder_input_block","placeholder_handler_block"],
    },
    {
        uuid: "placeholder_input_block",
        applicationId: "1",
        name: "placeholder block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {

        },
        childrenIds: ["placeholder_text_label", ],
    },
    {
        uuid: "placeholder_text_label",
        name: "placeholder text label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Placeholder';
              return label;`
            },
            
        },
        style: {
            'width':'90px'
        },
    },
    {
        uuid: "placeholder_text_input",
        name: "placeholder text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        ...COMMON_ATTRIBUTES,
        style: {
            ...TextInputTheme
        },
        event: {
            valueChange:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const newPlaceholderText = EventData.value;
                        updateInput(currentComponent,'placeholder','value',newPlaceholderText);
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
                if(currentComponent.input?.placeholder?.type=="value"){
                const currentPlaceholderText=currentComponent.input?.placeholder?.value??'';
                return currentPlaceholderText;
                } 
                return ''
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
                if(currentComponent.input?.placeholder?.type =="handler" && currentComponent.input?.placeholder?.value){
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
                const inputPlaceHolder ="placeholder";
             return  inputPlaceHolder;
            `
            }
        }
    },
    {
        uuid: "placeholder_handler_block",
        applicationId: "1",
        name: "placeholder handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {

            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["placeholder_text_input","placeholder_handler"],
    },
    {
        uuid: "placeholder_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "placeholder handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='placeholder';
                let placeholderHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.placeholder?.type =='handler' && currentComponent?.input?.placeholder?.value){
                            placeholderHandler = currentComponent?.input?.placeholder?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,placeholderHandler];
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
                    if(EventData.value != currentComponent?.input?.placeholder?.value)
                    updateInput(currentComponent,'placeholder','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]