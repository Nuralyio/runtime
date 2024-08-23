import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "button_label_text_block",
        applicationId: "1",
        name: "button label text block",
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

        childrenIds: ["button_text_label", "button_label_text_input"],
    },
    {
        uuid: "button_text_label",
        name: "label text label",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Label';
               label;
            `
            }
        },
    },
    {
        uuid: "button_label_text_input",
        name: "button label text input",
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
                        const newLabelText = EventData.value;
                        updateInput(currentComponent,'label','string',newLabelText);
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
                const currentLabel=  currentComponent.input?.label.value??'';
                currentLabel;
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]