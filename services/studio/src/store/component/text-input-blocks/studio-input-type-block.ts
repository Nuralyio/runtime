import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";

export default [
    {
        uuid: "input_type_block",
        applicationId: "1",
        name: "input type block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: { 
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between',
            'width':'330px',
            'margin-top': '10px',
        },

        childrenIds: ["input_stype_radio_block","input_type_handler_block"],
    },
    {
        uuid: "input_stype_radio_block",
        applicationId: "1",
        name: "input type radio block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["input_type_label", "input_type_radio"],
    },
    
    {
        uuid: "input_type_label",
        name: "input type label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Type';
             return label;
            `
            }
        },
        style: {
            'font-size':'14px',
            width:'90px'

        }
    },
    {
        uuid: "input_type_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "input type radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let currentType="";
                let isDisabled=false;
                if(currentComponent.input?.type?.type =='handler' && currentComponent.input?.type?.value){
                    isDisabled = true
                }
                else 
                currentType = currentComponent.input?.type?.value || 'text'
                const options = 
                [
                    {
                        value: "text",
                        icon:'font',
                        disabled:isDisabled
                    }, 
                    {
                        value: "password",
                        icon:'lock',
                        disabled:isDisabled
                    },
                    {
                        value: "number",
                        icon:'hashtag',
                        disabled:isDisabled
                    }
                ]  
            const radioType='button' 
            const result =[options,currentType,radioType];
           return  result;
                `
            }
        },
        style: {
            display:'block',
            '--hybrid-button-height':'30px',
            '--hybrid-button-width':'30px',
        },
        event: {
            changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const typeValue = EventData.value?EventData.value:'text';
                    updateInput(currentComponent,'type','string',typeValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "input_type_handler_block",
        applicationId: "1",
        name: "input type handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            width: "50px",
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["input_type_handler"],
    },
    {
        uuid: "input_type_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "type handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='type';
                let typeHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if(selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        if(currentComponent?.input?.type?.type =='handler' && currentComponent?.input?.type?.value){
                            typeHandler = currentComponent?.input?.type?.value
                        }
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,typeHandler];
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