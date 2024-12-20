import { ComponentType } from "$store/component/interface.ts";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes.ts";
import { InputBlockContainerTheme, RadioButtonWithThreeOptionsTheme } from "../editor/utils/common-editor-theme.ts";

export default [
    {
        uuid: "status_block",
        applicationId: "1",
        name: "status block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: { 
            ...InputBlockContainerTheme
        },

        childrenIds: ["status_radios_block","status_handler_block"],
    },
    {
        uuid: "status_radios_block",
        applicationId: "1",
        name: "status input block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'align-items':'center',
            'justify-content':'space-between'
        },
        childrenIds: ["status_label", ],
    },
    
    {
        uuid: "status_label",
        name: "status label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Status';
             return label;
            `
            }
        },
        style: {
            width:'90px',

        }
    },
    {
        uuid: "status_radio",
        applicationId: "1",
        component_type: ComponentType.RadioButton,
        ...COMMON_ATTRIBUTES,
        style:{
        ...RadioButtonWithThreeOptionsTheme
        },
        styleHandlers: {},
        name: "status radio",
        input: {
            value: {
                type: "handler",
                value: /* js */ ` 
                const selectedComponens =  GetVar( "selectedComponents")||[];
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                let isDisabled = false;
                let currentState =''
                if(currentComponent.styleHandlers && currentComponent?.styleHandlers?.state) {
                    isDisabled = true
                }
                else
                currentState = currentComponent.style && currentComponent.style['state'] || 'default'
                
                const options = 
                [
                    {
                        value: "default",
                        icon:'font-awesome',
                        disabled:isDisabled
                    }, 
                    {
                        value: "warning",
                        icon:'triangle-exclamation',
                        disabled:isDisabled
                    },
                    {
                        value: "error",
                        icon:'circle-exclamation',
                        disabled:isDisabled
                    }
                ]  
            const radioType='button' 
            const result =[options,currentState,radioType];
           return  result;
                `
            }
        },
        event: {
            changed: /* js */ `

            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    const stateValue = EventData.value?EventData.value:'default';
                    updateStyle(currentComponent,'state',stateValue)
                }
            }catch(error){
                console.log(error);
            }  
      `
        },
    },
    {
        uuid: "status_handler_block",
        applicationId: "1",
        name: "status handler block",
        component_type: ComponentType.VerticalContainer,
        ...COMMON_ATTRIBUTES,
        style: {
            display:'flex',
            'justify-content':'space-between',
        },
        
        childrenIds: ["status_radio", "status_handler"],
    },
    {
        uuid: "status_handler",
        applicationId: "1",
        component_type: ComponentType.Event,
        ...COMMON_ATTRIBUTES,
        styleHandlers: {},
        name: "status handler",
        style: {
                display:'block',
        },
        input: { 
            value: {
                type: 'handler',
                value: /* js */`
                const parameter ='status';
                let statusHandler=''
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)    
                    statusHandler =currentComponent?.styleHandlers && currentComponent?.styleHandlers['state'] || ''  
                    }
                }catch(error){
                    console.log(error);
                }
                return [parameter,statusHandler];
            `
            }
        },
        
        event: {
            codeChange: /* js */ `
            try{
                const selectedComponens =  GetVar( "selectedComponents")||[];
                if(selectedComponens.length) {
                    const selectedComponent = selectedComponens[0];
                    let currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                    updateStyleHandlers(currentComponent,'state',EventData.value)
                }
            }catch(error){
                console.log(error);
            }
      `
        },
    },

]