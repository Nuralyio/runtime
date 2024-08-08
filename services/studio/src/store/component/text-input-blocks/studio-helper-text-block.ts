import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
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
            'flex-direction':'column'
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
                label;`
            }
        },
        style: {},
    },
    {
        uuid: "helper_text_input",
        name: "helper text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            size:'medium'
        },
        event: {
            valueChange: {
                type: "handler",
                value: /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        console.log('new value ',EventData.value)
                        // here I need to pass new helper text value to the component
                    }
                }catch(error){
                    console.log(error);
                } 
  `
            }
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
                const currentHelperText= currentComponent.parameters.label || '';
                currentHelperText;
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]