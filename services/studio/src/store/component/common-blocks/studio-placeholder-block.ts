import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "placeholder_text_block",
        applicationId: "1",
        name: "placeholder text block",
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

        childrenIds: ["placeholder_text_label", "placeholder_text_input"],
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
                label;`
            },
            
        },
        style: {},
    },
    {
        uuid: "placeholder_text_input",
        name: "placeholder text input",
        applicationId: "1",
        component_type: ComponentType.TextInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            size:'medium'
        },
        event: {
            valueChange:  /* js */ `
                try{
                    const selectedComponens =  GetVar( "selectedComponents")||[];
                    if( selectedComponens.length) {
                        const selectedComponent = selectedComponens[0];
                        const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                        const newPlaceholderText = EventData.value;
                        updateInput(currentComponent,'placeholder','string',newPlaceholderText);
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
                const currentPlaceholderText=  currentComponent.input?.placeholder?.value??'';
                currentPlaceholderText;
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            placeholder: {
                type: 'handler',
                value: /* js */`
                const inputPlaceHolder ="placeholder";
                inputPlaceHolder;
            `
            }
        }
    },

]