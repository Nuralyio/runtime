import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
export default [
    {
        uuid: "helper_text_block",
        applicationId: "1",
        name: "helper text block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        input: {
            direction: "vertical",
        },
        ...COMMON_ATTRIBUTES,
        style: {
             display:'flex',
             'align-items':'center',
             'justify-content':'space-between',
        },

        childrenIds: ["helper_input_block","helper_handler_block"],
    },
    {
        uuid: "helper_input_block",
        applicationId: "1",
        name: "placeholder block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["helper_text_label", "helper_text_input"],
    },
    {
        uuid: "helper_text_label",
        name: "helper text label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Helper text';
              return label;`
            },
            
        },
        style: {
            'width':'90px'
        },
    },
    {
        uuid: "helper_text_input",
        name: "helper text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            size:'small',
            width:'120px'
        },
        event: {
            valueChange:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const newHelperText = EventData.value;
                        updateInput(currentComponent,'helper','value',newHelperText);
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
                if(currentComponent.input?.helper?.type=="value"){
                 const currentHelperText=  currentComponent.input?.helper?.value??'';
                 return currentHelperText;
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
                if(currentComponent.input?.helper?.type =="handler"&&currentComponent.input?.helper?.value){
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
                const inputPlaceHolder ="helper text";
                return inputPlaceHolder;
            `
            }
        }
    },
    {
        uuid: "helper_handler_block",
        applicationId: "1",
        name: "helper handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["helper_handler"],
    },
    {
        uuid: "helper_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "helper handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='helper';
                let helperHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.helper?.type =='handler' && currentComponent?.input?.helper?.value){
                           helperHandler = currentComponent?.input?.helper?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,helperHandler];
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
                    if(EventData.value != currentComponent?.input?.helper?.value != EventData.value )
                    updateInput(currentComponent,'helper','handler',EventData.value);
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },
]