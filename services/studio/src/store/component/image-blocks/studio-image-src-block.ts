import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "image_src_text_block",
        applicationId: "1",
        name: "image src text block",
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

        childrenIds: ["label_image_src", "src_text_input"],
    },
    {
        uuid: "label_image_src",
        name: "label image src",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
               const label ='Src';
               label;
            `
            }
        },
    },
    {
        uuid: "src_text_input",
        name: "src text input",
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
                        const newSrcText = EventData.value;
                        updateInput(currentComponent,'src','string',newSrcText);
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
                const currentSrc=  currentComponent.input?.src?.value??'';
                currentSrc;
            }

        }catch(e){
            console.log(e);
        }
            `
            },
            placeholder: {
                type: 'handler',
                value: /* js */`
                const inputPlaceHolder ="src";
                inputPlaceHolder;
            `
            }
        }
    },

]