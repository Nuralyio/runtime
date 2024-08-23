import { ComponentType } from "../interface";
import { COMMON_ATTRIBUTES } from "../helper/common_attributes";
export default [
    {
        uuid: "image_height_vertical_container",
        applicationId: "1",
        name: "image width vertical container",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},

        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
        },
        childrenIds: ["image_height_block"],
    },
    {
        uuid: "image_height_block",
        applicationId: "1",
        name: "Image height block",
        component_type: ComponentType.VerticalContainer,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "250px",
            display:'flex',
            'flex-direction':'column'
        },
        childrenIds: ["image_height", "image_height_input"],
    },

    {
        uuid: "image_height",
        name: "image height",
        component_type: ComponentType.TextLabel,
        applicationId: "1",
        ...COMMON_ATTRIBUTES,
        input: {
            value: {
                type: 'handler',
                value: /* js */`
                const label ='Height';
                label;
            `
            }
        },
      
    },
    {
        uuid: "image_height_input",
        name: "name",
        applicationId: "1",
        component_type: ComponentType.NumberInput,
        styleHandlers: {},
        ...COMMON_ATTRIBUTES,
        style: {
            width: "20px",
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
                            updateInput(currentComponent, "height", "string",EventData.value);
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
            if( selectedComponens.length) {
                const selectedComponent = selectedComponens[0];
                const currentComponent = GetComponent(selectedComponent, GetVar("currentEditingApplication").uuid)
                const imageHeight = currentComponent.input?.height?.value??''
                const unity="px";
                [imageHeight,unity];
            }

        }catch(e){
            console.log(e);
        }
            `
            }
        }
    },

]